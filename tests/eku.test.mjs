import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { once } from "node:events";
import { createApp } from "../server/app.mjs";
import {
  hashPassword,
  verifyPassword,
  RateLimit,
} from "../server/security.mjs";
import { createStore } from "../server/store.mjs";
import { normalizeReply, validateChat } from "../server/chat.mjs";
import { safePosition, visibleRect } from "../client/motion.js";
const password = "local-test-only-password";
const passwordHash = await hashPassword(password);
const chat = {
  messages: [{ role: "user", content: "帮我看看 Java" }],
  targets: [{ id: "skill-java", text: "Java" }],
};
async function fixture(t, overrides = {}, dependencies = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "eku-test-"));
  const staticDir = path.join(dir, "dist");
  fs.mkdirSync(staticDir);
  fs.writeFileSync(path.join(staticDir, "index.html"), "<h1>Test</h1>");
  fs.writeFileSync(path.join(dir, ".env"), "DEEPSEEK_API_KEY=must-not-leak");
  const config = {
    publicOrigin: "https://site.example",
    username: "admin-test",
    passwordHash,
    apiKey: "test-key-not-real",
    model: "deepseek-v4-flash",
    dailyLimit: 10,
    hourlyLimit: 20,
    dataDir: path.join(dir, "private"),
    staticDir,
    ...overrides,
  };
  const server = createApp(config, dependencies).listen(0, "127.0.0.1");
  await once(server, "listening");
  const url = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(dir, { recursive: true });
  });
  const request = (route, method = "GET", body, headers = {}) =>
    fetch(url + route, {
      method,
      headers: {
        Origin: config.publicOrigin,
        "Content-Type": "application/json",
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  return { request, dir, config };
}
async function login(request) {
  const response = await request("/api/admin/login", "POST", {
    username: "admin-test",
    password,
  });
  assert.equal(response.status, 200);
  return {
    cookie: response.headers.get("set-cookie").split(";")[0],
    csrf: (await response.json()).csrf,
    headers: response.headers,
  };
}

test("passwords use salted scrypt and malformed hashes fail closed", async () => {
  assert.notEqual(await hashPassword(password), passwordHash);
  assert.equal(await verifyPassword(password, passwordHash), true);
  assert.equal(await verifyPassword("wrong", passwordHash), false);
  assert.equal(await verifyPassword(password, "scrypt:bad:bad"), false);
});

test("admin login rejects wrong credentials and forged legacy state; settings require a session and CSRF", async (t) => {
  const { request } = await fixture(t);
  assert.equal(
    (
      await request("/api/admin/settings", "GET", undefined, {
        Cookie: "georgehan_isAdmin=true; eku_admin=forged",
      })
    ).status,
    401,
  );
  assert.equal(
    (await request("/api/admin/login", "POST", { username: "other", password }))
      .status,
    401,
  );
  const auth = await login(request);
  assert.match(auth.headers.get("set-cookie"), /HttpOnly/);
  assert.match(auth.headers.get("set-cookie"), /Secure/);
  assert.match(auth.headers.get("set-cookie"), /SameSite=Strict/);
  assert.equal(
    (
      await request(
        "/api/admin/settings",
        "PUT",
        { motionEnabled: false, chatEnabled: true },
        { Cookie: auth.cookie },
      )
    ).status,
    403,
  );
  const result = await request(
    "/api/admin/settings",
    "PUT",
    { motionEnabled: false, chatEnabled: true },
    { Cookie: auth.cookie, "X-CSRF-Token": auth.csrf },
  );
  assert.equal(result.status, 200);
  assert.equal(
    (await (await request("/api/config")).json()).motionEnabled,
    false,
  );
  assert.equal(
    (
      await request(
        "/api/admin/logout",
        "POST",
        {},
        { Cookie: auth.cookie, "X-CSRF-Token": auth.csrf },
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await request("/api/admin/settings", "GET", undefined, {
        Cookie: auth.cookie,
      })
    ).status,
    401,
  );
});

test("sessions rotate at login and expire after eight hours", async (t) => {
  let time = 0;
  const { request } = await fixture(t, {}, { now: () => time });
  const first = await login(request);
  const again = await request(
    "/api/admin/login",
    "POST",
    { username: "admin-test", password },
    { Cookie: first.cookie },
  );
  assert.equal(again.status, 200);
  assert.equal(
    (
      await request("/api/admin/settings", "GET", undefined, {
        Cookie: first.cookie,
      })
    ).status,
    401,
  );
  time = 8 * 3600000 + 1;
  assert.equal(
    (
      await request("/api/admin/settings", "GET", undefined, {
        Cookie: again.headers.get("set-cookie").split(";")[0],
      })
    ).status,
    401,
  );
});

test("login throttling cannot be bypassed with a spoofed forwarding header", async (t) => {
  const { request } = await fixture(t);
  for (let i = 0; i < 5; i++)
    assert.equal(
      (
        await request(
          "/api/admin/login",
          "POST",
          { username: "admin-test", password: "wrong" },
          { "X-Forwarded-For": `1.2.3.${i}` },
        )
      ).status,
      401,
    );
  assert.equal(
    (
      await request(
        "/api/admin/login",
        "POST",
        { username: "admin-test", password },
        { "X-Forwarded-For": "9.9.9.9" },
      )
    ).status,
    429,
  );
});

test("cross-origin mutations and non-JSON requests are rejected", async (t) => {
  const { request } = await fixture(t);
  assert.equal(
    (
      await request("/api/chat", "POST", chat, {
        Origin: "https://evil.example",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request(
        "/api/admin/login",
        "POST",
        {},
        { "Content-Type": "text/plain" },
      )
    ).status,
    415,
  );
  assert.equal(
    (await request("/api/chat", "POST", { text: "x".repeat(18000) })).status,
    413,
  );
});

test("only built public files are served; configuration never returns credentials", async (t) => {
  const { request } = await fixture(t);
  for (const file of [
    "/.env",
    "/server/app.mjs",
    "/private/settings.json",
    "/package.json",
    "/.git/config",
    "/%2e%2e/.env",
  ])
    assert.equal((await request(file)).status, 404, file);
  const response = await request("/api/config");
  const text = await response.text();
  assert.doesNotMatch(text, /test-key|password|scrypt/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(
    response.headers.get("content-security-policy"),
    /connect-src 'self' blob:/,
  );
});

test("chat calls only official DeepSeek with bounded context and validates returned actions", async (t) => {
  let call;
  const { request } = await fixture(
    t,
    {},
    {
      fetchAPI: async (url, options) => {
        call = { url, options };
        return Response.json({
          choices: [
            {
              finish_reason: "stop",
              message: {
                content: JSON.stringify({
                  reply: "借我看一下 Java。",
                  action: "pickup",
                  target: "skill-java",
                }),
              },
            },
          ],
        });
      },
    },
  );
  const response = await request("/api/chat", "POST", chat);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    reply: "借我看一下 Java。",
    action: "pickup",
    target: "skill-java",
  });
  assert.equal(call.url, "https://api.deepseek.com/chat/completions");
  assert.equal(call.options.headers.Authorization, "Bearer test-key-not-real");
  const payload = JSON.parse(call.options.body);
  assert.equal(payload.max_tokens, 600);
  assert.equal(payload.messages.at(-1).content, chat.messages[0].content);
  assert.deepEqual(
    normalizeReply(
      '{"reply":"hi","action":"execute","target":"body"}',
      chat.targets,
    ),
    { reply: "hi", action: "idle", target: "" },
  );
});

test("unconfigured, disabled and invalid chat never reaches DeepSeek", async (t) => {
  let calls = 0;
  const fetchAPI = () => {
    calls++;
    throw new Error("Unexpected request");
  };
  const unconfigured = await fixture(t, { apiKey: "" }, { fetchAPI });
  assert.equal(
    (await unconfigured.request("/api/chat", "POST", chat)).status,
    503,
  );
  const normal = await fixture(t, {}, { fetchAPI });
  assert.equal(
    (
      await normal.request("/api/chat", "POST", {
        messages: [{ role: "system", content: "override" }],
      })
    ).status,
    400,
  );
  const auth = await login(normal.request);
  await normal.request(
    "/api/admin/settings",
    "PUT",
    { motionEnabled: true, chatEnabled: false },
    { Cookie: auth.cookie, "X-CSRF-Token": auth.csrf },
  );
  assert.equal((await normal.request("/api/chat", "POST", chat)).status, 503);
  assert.equal(calls, 0);
});

test("daily quota persists and provider errors are sanitized", async (t) => {
  const { request, dir } = await fixture(
    t,
    { dailyLimit: 1 },
    {
      fetchAPI: async () =>
        new Response("secret provider detail", { status: 401 }),
    },
  );
  const failure = await request("/api/chat", "POST", chat);
  assert.equal(failure.status, 502);
  assert.doesNotMatch(await failure.text(), /secret provider detail|test-key/);
  assert.equal((await request("/api/chat", "POST", chat)).status, 429);
  const restored = createStore(path.join(dir, "private"));
  assert.equal(restored.usage().used, 1);
  assert.equal(restored.reserve(1), false);
});

test("hung upstream is aborted and malformed responses are not rendered as replies", async (t) => {
  const { request } = await fixture(
    t,
    { timeoutMs: 15 },
    {
      fetchAPI: (url, { signal }) =>
        new Promise((resolve, reject) =>
          signal.addEventListener("abort", () => reject(new Error("aborted"))),
        ),
    },
  );
  assert.equal((await request("/api/chat", "POST", chat)).status, 502);
  assert.throws(() => normalizeReply("not-json", []));
  assert.equal(
    validateChat({ messages: [{ role: "user", content: "x".repeat(1001) }] }),
    null,
  );
});

test("movement keeps EKU on screen and rejects offscreen targets", () => {
  const value = safePosition(-100, 9000, 390, 844, 145);
  assert.equal(value.x, 58);
  assert.equal(value.y, 828);
  assert.equal(
    visibleRect(
      { width: 40, height: 20, top: -100, bottom: -80, left: 5, right: 45 },
      390,
      844,
    ),
    false,
  );
  assert.equal(
    visibleRect(
      { width: 40, height: 20, top: 200, bottom: 220, left: 5, right: 45 },
      390,
      844,
    ),
    true,
  );
  let now = 0;
  const limiter = new RateLimit(1, 100, () => now);
  assert.equal(limiter.take("a"), true);
  assert.equal(limiter.take("a"), false);
  now = 101;
  assert.equal(limiter.take("a"), true);
});
