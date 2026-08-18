import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const { password, id, fields } = await req.json();
  if (typeof password !== "string" || password !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!id || !fields) {
    return NextResponse.json({ error: "Missing id or fields" }, { status: 400 });
  }
  const db = getAdminDb();
  await db.collection("teedropper_products").doc(id).update(fields);
  return NextResponse.json({ success: true });
}
