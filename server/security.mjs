import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
export async function hashPassword(
  password,
  salt = randomBytes(16).toString("hex"),
) {
  const key = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password, encoded) {
  const [scheme, salt, key] = (encoded || "").split(":");
  if (
    scheme !== "scrypt" ||
    !/^[a-f0-9]{32}$/.test(salt || "") ||
    !/^[a-f0-9]{128}$/.test(key || "")
  )
    return false;
  const actual = await scrypt(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(key, "hex"));
}
export function equalText(a, b) {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}
export class RateLimit {
  constructor(limit, interval, now = Date.now) {
    this.limit = limit;
    this.interval = interval;
    this.now = now;
    this.entries = new Map();
  }
  take(key) {
    const now = this.now();
    for (const [id, entry] of this.entries)
      if (entry.expires <= now) this.entries.delete(id);
    let entry = this.entries.get(key);
    if (!entry) {
      if (this.entries.size >= 10000) return false;
      entry = { count: 0, expires: now + this.interval };
      this.entries.set(key, entry);
    }
    if (entry.count >= this.limit) return false;
    entry.count++;
    return true;
  }
}
