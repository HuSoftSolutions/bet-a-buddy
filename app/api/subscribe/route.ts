import { NextResponse } from "next/server";

interface ContactPayload {
  email_address: string;
  first_name: string;
  last_name: string;
  list_memberships: string[];
}

export async function POST(request: Request) {
  try {
    const { first_name, last_name, email } = await request.json();

    // Validate required fields
    if (!first_name || !last_name || !email?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: first_name, last_name, and email.",
        },
        { status: 400 }
      );
    }

    // Retrieve Constant Contact credentials
    const ACCESS_TOKEN = process.env.CONSTANT_CONTACT_ACCESS_TOKEN;
    const LIST_ID = process.env.CONSTANT_CONTACT_MAIN_LIST_ID;
    if (!ACCESS_TOKEN || !LIST_ID) {
      return NextResponse.json(
        { success: false, error: "Missing Constant Contact credentials." },
        { status: 500 }
      );
    }

    // Build the minimal payload
    const payload: ContactPayload = {
      first_name,
      last_name: last_name,
      list_memberships: [LIST_ID],
      email_address: email.trim().substring(0, 50),
    };

    console.log("Sending payload to Constant Contact:", payload);

    const apiUrl = "https://api.cc.email/v3/contacts/sign_up_form";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error from Constant Contact:", errorData);
      return NextResponse.json(
        { success: false, error: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Error processing contact:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    // Fallback for non-Error exceptions
    return NextResponse.json(
      { success: false, error: "Unknown error occurred." },
      { status: 500 }
    );
  }
}
