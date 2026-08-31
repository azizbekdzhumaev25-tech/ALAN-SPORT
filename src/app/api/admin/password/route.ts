import { NextResponse } from "next/server";
import { checkPassword, requireAdmin } from "@/lib/admin-auth";
import { hashPasswordSync, setStoredHash } from "@/lib/admin-store";
import { checkMaliciousPayload } from "@/lib/validation";

// Смена пароля — без внешних серверов/БД, просто файл data/admin.json + хеш
// Клиент сам меняет пароль в админке, работает и на Netlify (файл эфемерен — после рестарта откатится к env, но для MVP без серверов это ок)
export async function PUT(req: Request) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized — qayta login qiling" }, { status: 401 });
    }

    const body = await req.json();
    const oldPassword = String(body.oldPassword || "");
    const newPassword = String(body.newPassword || "");

    checkMaliciousPayload({ oldPassword, newPassword });

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Eski va yangi parol kiriting" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak" }, { status: 400 });
    }

    if (newPassword.length > 64) {
      return NextResponse.json({ error: "Parol juda uzun (max 64)" }, { status: 400 });
    }

    if (oldPassword === newPassword) {
      return NextResponse.json({ error: "Yangi parol eskisi bilan bir xil bo'lmasligi kerak" }, { status: 400 });
    }

    // Проверяем старый пароль (файл или env)
    if (!checkPassword(oldPassword)) {
      return NextResponse.json({ error: "Eski parol noto'g'ri" }, { status: 401 });
    }

    // Хешируем и сохраняем без внешнего сервера — просто файл
    const hash = hashPasswordSync(newPassword);
    setStoredHash(hash);

    return NextResponse.json({ ok: true, message: "Parol muvaffaqiyatli o'zgartirildi" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Xatolik" }, { status: 500 });
  }
}

// Проверить установлен ли кастомный пароль (для UI)
export async function GET() {
  try {
    const { getStoredHash } = await import("@/lib/admin-store");
    const hasCustom = !!getStoredHash();
    return NextResponse.json({ hasCustom });
  } catch {
    return NextResponse.json({ hasCustom: false });
  }
}
