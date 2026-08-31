import fs from "fs";
import path from "path";
import crypto from "crypto";

const filePath = path.join(process.cwd(), "data", "admin.json");
const SALT = "alan-sport-2026-salt-v1";

// Хеш для сервера (Node crypto) — тот же что и на клиенте (SHA-256 + соль)
export function hashPasswordSync(password: string): string {
  return crypto.createHash("sha256").update(password + SALT).digest("hex");
}

export function getStoredHash(): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    if (typeof data.hash === "string" && data.hash.length === 64) return data.hash;
    return null;
  } catch {
    return null;
  }
}

export function setStoredHash(hash: string) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ hash, updatedAt: new Date().toISOString() }, null, 2), "utf-8");
  } catch (err) {
    console.error("admin.json save error:", err);
    throw err;
  }
}

export function verifyPasswordSync(password: string, hash: string): boolean {
  return hashPasswordSync(password) === hash;
}

// Для проверки: сначала файл, потом env
export function isCustomPasswordSet(): boolean {
  return !!getStoredHash();
}
