import { NextResponse } from "next/server";
import { checkPassword, createToken } from "@/lib/admin-auth";
import { checkRateLimit, getIpFromRequest } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // 1. Получаем IP пользователя
    const ip = getIpFromRequest(req);

    // 2. Проверяем лимит: максимум 5 попыток логина за 15 минут (900000 мс)
    const rateLimit = checkRateLimit(ip, 5, 900_000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { ok: false, error: "Juda ko'p urinishlar. 15 daqiqadan so'ng qayta urinib ko'ring." },
        { status: 429 } // 429 - Too Many Requests
      );
    }

    const body = await req.json();
    const password = String(body.password || "");

    if (!checkPassword(password)) {
      return NextResponse.json({ ok: false, error: "Parol noto'g'ri" }, { status: 401 });
    }

    const token = createToken();
    return NextResponse.json({ ok: true, token });
  } catch {
    return NextResponse.json({ ok: false, error: "Xatolik" }, { status: 400 });
  }
}