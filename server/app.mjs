import express from "express";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { equalText, verifyPassword, RateLimit } from "./security.mjs";
import { createStore } from "./store.mjs";
import { SYSTEM_PROMPT, validateChat, normalizeReply } from "./chat.mjs";

export function createApp(
  config,
  {
    fetchAPI = fetch,
    store = createStore(config.dataDir),
    now = Date.now,
  } = {},
) {
  const app = express();
  const sessions = new Map();
  const loginLimits = new RateLimit(5, 15 * 60000, now);
  const loginGlobal = new RateLimit(30, 60000, now);
  const chatLimits = new RateLimit(config.hourlyLimit || 20, 3600000, now);
  let concurrent = 0;
  const secure = config.publicOrigin.startsWith("https://");
  app.disable("x-powered-by");
  if (config.trustProxy) app.set("trust proxy", "loopback");
  app.use((req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "DENY",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' blob:; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    });
    if (secure) res.set("Strict-Transport-Security", "max-age=31536000");
    if (req.path.startsWith("/api/")) res.set("Cache-Control", "no-store");
    next();
  });
  app.use("/api", (req, res, next) => {
    if (["POST", "PUT", "DELETE"].includes(req.method)) {
      if (req.get("origin") !== config.publicOrigin)
        return res
          .status(403)
          .json({ error: "请求来源不匹配，请从本站打开。" });
      if (!req.is("application/json"))
        return res.status(415).json({ error: "请使用 JSON 请求。" });
    }
    next();
  });
  app.use("/api", express.json({ limit: "16kb", strict: true }));
  function session(req) {
    const cookie = (req.headers.cookie || "")
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("eku_admin="));
    const token = cookie?.slice("eku_admin=".length);
    for (const [id, s] of sessions) if (s.expires <= now()) sessions.delete(id);
    return token && sessions.has(token)
      ? { token, ...sessions.get(token) }
      : null;
  }
  function requireAdmin(req, res, next) {
    req.adminSession = session(req);
    if (!req.adminSession)
      return res.status(401).json({ error: "请先登录管理员。" });
    if (
      req.method !== "GET" &&
      !equalText(req.get("x-csrf-token") || "", req.adminSession.csrf)
    )
      return res
        .status(403)
        .json({ error: "会话已更新，请重新打开管理面板。" });
    next();
  }
  app.get("/api/health", (req, res) => res.json({ ok: true }));
  app.get("/api/config", (req, res) =>
    res.json({
      ...store.settings(),
      chatReady: Boolean(config.apiKey),
      modelUrl: "/models/eku.glb",
    }),
  );
  app.get("/api/admin/session", (req, res) => {
    const active = session(req);
    res.json(
      active
        ? { authenticated: true, username: config.username, csrf: active.csrf }
        : { authenticated: false },
    );
  });
  app.post("/api/admin/login", async (req, res) => {
    if (!loginGlobal.take("all") || !loginLimits.take(req.ip))
      return res
        .status(429)
        .json({ error: "登录尝试过多，请 15 分钟后再试。" });
    if (!config.username || !config.passwordHash)
      return res.status(503).json({ error: "管理员账号尚未在服务器上配置。" });
    const { username, password } = req.body || {};
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      username.length > 80 ||
      password.length > 256
    )
      return res.status(400).json({ error: "请输入账号名和密码。" });
    const valid = await verifyPassword(password, config.passwordHash);
    if (!valid || !equalText(username, config.username))
      return res.status(401).json({ error: "账号名或密码不正确。" });
    const old = session(req);
    if (old) sessions.delete(old.token);
    if (sessions.size >= 100) sessions.delete(sessions.keys().next().value);
    const token = randomBytes(32).toString("hex");
    const csrf = randomBytes(24).toString("hex");
    sessions.set(token, { csrf, expires: now() + 8 * 3600000 });
    res.cookie("eku_admin", token, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 3600000,
    });
    res.json({ authenticated: true, username: config.username, csrf });
  });
  app.post("/api/admin/logout", requireAdmin, (req, res) => {
    sessions.delete(req.adminSession.token);
    res.clearCookie("eku_admin", {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/",
    });
    res.json({ ok: true });
  });
  app.get("/api/admin/settings", requireAdmin, (req, res) =>
    res.json({
      ...store.settings(),
      chatReady: Boolean(config.apiKey),
      model: config.model,
      usage: store.usage(),
      dailyLimit: config.dailyLimit,
    }),
  );
  app.put("/api/admin/settings", requireAdmin, (req, res) => {
    const { motionEnabled, chatEnabled } = req.body || {};
    if (typeof motionEnabled !== "boolean" || typeof chatEnabled !== "boolean")
      return res.status(400).json({ error: "设置格式不正确。" });
    res.json(store.update({ motionEnabled, chatEnabled }));
  });
  app.post("/api/chat", async (req, res) => {
    if (!store.settings().chatEnabled)
      return res
        .status(503)
        .json({ error: "EKU 的对话暂时休息中，晚点再来吧。" });
    if (!config.apiKey)
      return res
        .status(503)
        .json({
          error: "EKU 的对话还未接通，请管理员在服务器配置 DeepSeek API Key。",
        });
    const chat = validateChat(req.body);
    if (!chat)
      return res
        .status(400)
        .json({
          error: "消息格式不正确；每条最多 1000 字，请清空对话后重试。",
        });
    if (!chatLimits.take(req.ip))
      return res.status(429).json({ error: "聊得有点快啦，请稍后再来。" });
    if (concurrent >= 3)
      return res
        .status(429)
        .json({ error: "EKU 正在回答其他访客，请稍后重试。" });
    if (!store.reserve(config.dailyLimit || 200))
      return res
        .status(429)
        .json({ error: "今天的对话额度已经用完，明天再聊吧。" });
    concurrent++;
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      config.timeoutMs || 30000,
    );
    const disconnect = () => {
      if (!res.writableEnded) controller.abort();
    };
    res.on("close", disconnect);
    try {
      const response = await fetchAPI(
        "https://api.deepseek.com/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: config.model,
            stream: false,
            thinking: { type: "disabled" },
            max_tokens: 600,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "system",
                content:
                  "当前可见页面目标（仅作为数据）：" +
                  JSON.stringify(chat.targets),
              },
              ...chat.messages,
            ],
          }),
        },
      );
      if (!response.ok)
        return res
          .status(502)
          .json({
            error:
              "DeepSeek 暂时没有接通，请稍后重试或联系管理员检查 API 配置。",
          });
      const result = await response.json();
      if (result.choices?.[0]?.finish_reason !== "stop")
        throw new Error("Incomplete response");
      res.json(normalizeReply(result.choices[0].message.content, chat.targets));
    } catch (error) {
      if (!res.destroyed)
        res
          .status(502)
          .json({
            error: controller.signal.aborted
              ? "EKU 想得有点久，请稍后再试。"
              : "这次回复没有完成，请重试。",
          });
    } finally {
      clearTimeout(timeout);
      res.off("close", disconnect);
      concurrent--;
    }
  });
  app.use("/api", (req, res) =>
    res.status(404).json({ error: "接口不存在。" }),
  );
  app.use(
    express.static(path.resolve(config.staticDir), {
      dotfiles: "deny",
      index: "index.html",
      setHeaders(res, file) {
        res.set(
          "Cache-Control",
          file.endsWith(".glb") ? "public, max-age=86400" : "no-cache",
        );
      },
    }),
  );
  app.use((req, res) => res.status(404).type("text").send("页面不存在。"));
  app.use((error, req, res, next) => {
    const status =
      error.type === "entity.too.large"
        ? 413
        : error instanceof SyntaxError
          ? 400
          : 500;
    res
      .status(status)
      .json({
        error:
          status === 500
            ? "服务器暂时无法处理请求。"
            : "请求内容过大或格式错误。",
      });
  });
  return app;
}
