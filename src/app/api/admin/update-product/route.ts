import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

export async function POST(req: NextRequest) {
  const { password, id, fields } = await req.json();

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id || !fields) {
    return NextResponse.json({ error: "Missing id or fields" }, { status: 400 });
  }

  const db = getAdminDb();
  await db.collection("teedropper_products").doc(id).update(fields);

  return NextResponse.json({ success: true });
}
