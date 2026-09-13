import fs from "node:fs";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { hashPassword } from "../server/security.mjs";
if (!process.stdin.isTTY)
  throw new Error("Run npm run setup in an interactive terminal.");
let muted = false;
const output = new Writable({
  write(chunk, encoding, next) {
    if (!muted) process.stdout.write(chunk);
    next();
  },
});
const rl = createInterface({ input: process.stdin, output, terminal: true });
async function ask(question, secret = false) {
  process.stdout.write(question);
  muted = secret;
  const value = await rl.question("");
  muted = false;
  if (secret) process.stdout.write("\n");
  return value;
}
try {
  if (
    fs.existsSync(".env") &&
    (await ask("A .env exists. Replace it? Type YES: ")) !== "YES"
  )
    process.exit(0);
  const username = (await ask("Admin username: ")).trim();
  if (!/^[a-zA-Z0-9_.-]{3,40}$/.test(username))
    throw new Error("Use 3–40 letters, numbers, _, . or -.");
  const password = await ask(
    "Admin password (hidden, at least 12 characters): ",
    true,
  );
  if (password.length < 12 || password.length > 128)
    throw new Error("Password must contain 12–128 characters.");
  if (password !== (await ask("Repeat password: ", true)))
    throw new Error("Passwords do not match.");
  const apiKey = (
    await ask(
      "DeepSeek official API Key (hidden; leave empty to configure later): ",
      true,
    )
  ).trim();
  if (/[\r\n"'\s]/.test(apiKey))
    throw new Error("API key must not contain whitespace or quotes.");
  const origin = (
    await ask("Site origin (https://your-domain or http://localhost:3000): ")
  ).trim();
  if (new URL(origin).origin !== origin)
    throw new Error("Use an origin without a trailing slash.");
  const text =
    [
      `PUBLIC_ORIGIN=${origin}`,
      "HOST=127.0.0.1",
      "PORT=3000",
      `ADMIN_USERNAME=${username}`,
      `ADMIN_PASSWORD_HASH=${await hashPassword(password)}`,
      `DEEPSEEK_API_KEY=${apiKey}`,
      "DEEPSEEK_MODEL=deepseek-v4-flash",
      "CHAT_DAILY_LIMIT=200",
      "CHAT_HOURLY_LIMIT=20",
      "DATA_DIR=private",
      "TRUST_PROXY=loopback",
    ].join("\n") + "\n";
  fs.mkdirSync("private", { recursive: true, mode: 0o700 });
  fs.writeFileSync(".env", text, { mode: 0o600 });
  console.log(
    "Configuration saved to .env. Password is stored only as a scrypt hash. Restart the server to apply.",
  );
} finally {
  rl.close();
}
