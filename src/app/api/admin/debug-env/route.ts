import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  const key = "FIREBASE_SERVICE_ACCOUNT";
  const val = process.env[key];
  return NextResponse.json({
    has_firebase: !!val,
    firebase_length: val?.length ?? 0,
    firebase_first10: val?.slice(0, 10),
    has_admin_pw: !!process.env["ADMIN_PASSWORD"],
    has_next_public_admin_pw: !!process.env["NEXT_PUBLIC_ADMIN_PASSWORD"],
  });
}
