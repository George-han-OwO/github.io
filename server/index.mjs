import path from "node:path";
import { createApp } from "./app.mjs";
const port = Number(process.env.PORT || 3000);
const origin = process.env.PUBLIC_ORIGIN || `http://localhost:${port}`;
if (new URL(origin).origin !== origin)
  throw new Error("PUBLIC_ORIGIN must be an origin without a trailing slash.");
if (process.env.NODE_ENV === "production" && !origin.startsWith("https://"))
  throw new Error("Production requires an HTTPS PUBLIC_ORIGIN.");
const config = {
  publicOrigin: origin,
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
  username: process.env.ADMIN_USERNAME || "",
  passwordHash: process.env.ADMIN_PASSWORD_HASH || "",
  dataDir: path.resolve(process.env.DATA_DIR || "private"),
  staticDir: path.resolve("dist"),
  dailyLimit: Number(process.env.CHAT_DAILY_LIMIT || 200),
  hourlyLimit: Number(process.env.CHAT_HOURLY_LIMIT || 20),
  trustProxy: process.env.TRUST_PROXY === "loopback",
};
if (
  ![config.dailyLimit, config.hourlyLimit, port].every(
    (n) => Number.isSafeInteger(n) && n > 0,
  )
)
  throw new Error("Limits and PORT must be positive integers.");
createApp(config).listen(port, process.env.HOST || "127.0.0.1", () =>
  console.log(`EKU website: ${origin} (listening on port ${port})`),
);
