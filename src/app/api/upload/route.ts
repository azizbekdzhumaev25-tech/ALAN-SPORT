import { NextResponse } from "next/server";
import { saveImageToStore } from "@/lib/site";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}.${ext}`;
    const contentType = file.type || "image/jpeg";

    // Сохраняем в глобальный быстрейший сервис фото
    saveImageToStore(filename, buffer, contentType);

    const fileUrl = `/api/images/${filename}`;
    return NextResponse.json({ ok: true, url: fileUrl });
  } catch {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}