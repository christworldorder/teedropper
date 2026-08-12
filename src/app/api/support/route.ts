import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const orderEmail = formData.get("orderEmail") as string;
    const issue = formData.get("issue") as string;
    const description = formData.get("description") as string;
    const photo = formData.get("photo") as File | null;

    if (!email || !orderEmail || !issue || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY!);

    const attachments: { filename: string; content: Buffer }[] = [];
    if (photo && photo.size > 0) {
      const buffer = Buffer.from(await photo.arrayBuffer());
      attachments.push({ filename: photo.name || "photo.jpg", content: buffer });
    }

    await resend.emails.send({
      from: "TeeDropper Support <support@teedropper.com>",
      to: "teedropper@proton.me",
      subject: `[Support] ${issue} — ${orderEmail}`,
      html: `
        <h2>New Support Request</h2>
        <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
          <tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd;width:180px;">Customer Email</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd;">Checkout Email</td><td style="padding:8px;border:1px solid #ddd;">${orderEmail}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd;">Issue Type</td><td style="padding:8px;border:1px solid #ddd;">${issue}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd;">Description</td><td style="padding:8px;border:1px solid #ddd;">${description}</td></tr>
        </table>
        <br/>
        <p style="font-family:sans-serif;font-size:13px;color:#666;">Photo attached. To resolve: log into Printful → find order by email → Report a problem.</p>
      `,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Support email error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
