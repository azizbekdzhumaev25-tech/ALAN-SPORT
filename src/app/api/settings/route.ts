import { NextResponse } from "next/server";
import { getSettings, setSettings } from "@/lib/site";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  return NextResponse.json(getSettings());
}

export async function PUT(req: Request) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    setSettings(body);
    return NextResponse.json({ ok: true, settings: getSettings() });
  } catch {
    return NextResponse.json({ error: "Xatolik" }, { status: 400 });
  }
}