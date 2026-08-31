import fs from "fs";
import path from "path";
import crypto from "crypto";

const filePath = path.join(process.cwd(), "data", "admin.json");
// Netlify — read-only /var/task, пишем в /tmp
const fallbackPath = path.join("/tmp", "data", "admin.json");
const SALT = "alan-sport-2026-salt-v1";

function getFilePath(): string {
  // На Netlify сначала пробуем /tmp
  if (process.env.NETLIFY || process.cwd().startsWith("/var/task")) {
    return fallbackPath;
  }
  return filePath;
}

function getAllPaths(): string[] {
  return [filePath, fallbackPath];
}

// Хеш для сервера (Node crypto) — тот же что и на клиенте (SHA-256 + соль)
export function hashPasswordSync(password: string): string {
  return crypto.createHash("sha256").update(password + SALT).digest("hex");
}

export function getStoredHash(): string | null {
  for (const p of getAllPaths()) {
    try {
      if (!fs.existsSync(p)) continue;
      const raw = fs.readFileSync(p, "utf-8");
      const data = JSON.parse(raw);
      if (typeof data.hash === "string" && data.hash.length === 64) return data.hash;
    } catch {}
  }
  return null;
}

export function setStoredHash(hash: string) {
  const payload = JSON.stringify({ hash, updatedAt: new Date().toISOString() }, null, 2);
  let lastErr: any = null;
  for (const p of getAllPaths()) {
    try {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(p, payload, "utf-8");
      return;
    } catch (err: any) {
      lastErr = err;
      // Пробуем следующий путь (fallback /tmp)
      continue;
    }
  }
  console.error("admin.json save error:", lastErr);
  throw lastErr;
}

export function verifyPasswordSync(password: string, hash: string): boolean {
  return hashPasswordSync(password) === hash;
}

// Для проверки: сначала файл, потом env
export function isCustomPasswordSet(): boolean {
  return !!getStoredHash();
}
