import { NextResponse } from "next/server";
import { getCategories, saveCategories } from "@/lib/products";
import { DEFAULT_CATEGORIES } from "@/lib/site";
import { requireAdmin } from "@/lib/admin-auth";
import { checkMaliciousPayload } from "@/lib/validation";

export async function GET() {
  const saved = getCategories();
  if (saved.length > 0) {
    return NextResponse.json(saved);
  }
  return NextResponse.json(DEFAULT_CATEGORIES);
}

export async function PUT(req: Request) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const categories = Array.isArray(body.categories) ? body.categories : [];
    
    // Проверяем каждую категорию на безопасность
    for (const cat of categories) checkMaliciousPayload(cat);

    saveCategories(categories);
    return NextResponse.json({ ok: true, categories });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Xatolik" }, { status: 400 });
  }
}