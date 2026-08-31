import crypto from "crypto";
import { getStoredHash, verifyPasswordSync } from "./admin-store";

// Пароль ТОЛЬКО на сервере (лучше потом вынести в .env)
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "alan2026").trim();
const AUTH_SECRET = (process.env.ADMIN_SECRET || "alan-sport-secret-change-me-2026").trim();

// Простой токен = HMAC(password_ok + timestamp)
export function checkPassword(password: string): boolean {
  // 1. Проверяем кастомный пароль из data/admin.json (если клиент менял через админку — без серверов/БД)
  try {
    const customHash = getStoredHash();
    if (customHash) {
      return verifyPasswordSync(password, customHash);
    }
  } catch {
    // fallback к env
  }
  return password === ADMIN_PASSWORD;
}

export function createToken(): string {
  const payload = `admin:${Date.now()}`;
  const sig = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyToken(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [payload, sig] = raw.split(".");
    if (!payload || !sig) return false;

    const expected = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
    if (sig !== expected) return false;

    // Токен живёт 7 дней
    const ts = Number(payload.split(":")[1]);
    if (!ts || Date.now() - ts > 7 * 24 * 60 * 60 * 1000) return false;

    return true;
  } catch {
    return false;
  }
}

export function getTokenFromRequest(req: Request): string | null {
  const h = req.headers.get("authorization") || "";
  if (h.startsWith("Bearer ")) return h.slice(7).trim();
  return req.headers.get("x-admin-token");
}

export function requireAdmin(req: Request): boolean {
  return verifyToken(getTokenFromRequest(req));
}