
// app/api/send-email/route.ts
import sgMail from "@sendgrid/mail";
import { NextResponse } from "next/server";

// Set the API key (this runs on the server only)
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function POST(request: Request) {
  try {
    // Expecting JSON data with 'to', 'subject', and 'html'
    const { to, subject, html } = await request.json();

    const msg = {
      to,
      from: process.env.SENDER_EMAIL as string, // must be a verified sender
      subject,
      html,
    };

    // Send the email via SendGrid
    await sgMail.send(msg);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
		console.error("Error sending email:", error);
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    // Handle cases where the error is not an instance of Error
    return NextResponse.json({ success: false, error: "An unknown error occurred" }, { status: 500 });
  }
}
