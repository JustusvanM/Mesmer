import { NextResponse } from "next/server";
import { Resend } from "resend";

const TO_EMAIL = "justus@gomesmer.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Mesmer Contact <onboarding@resend.dev>";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, email, stage, message, newsletter } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);

    const html = `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name.trim())}</p>
      <p><strong>Email:</strong> ${escapeHtml(email.trim())}</p>
      <p><strong>Company stage:</strong> ${stage ? escapeHtml(stage) : "(not provided)"}</p>
      <p><strong>Newsletter signup:</strong> ${newsletter ? "Yes" : "No"}</p>
      <h3>Message</h3>
      <p>${escapeHtml(message.trim()).replace(/\n/g, "<br>")}</p>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: `Mesmer contact: ${name.trim()}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}
