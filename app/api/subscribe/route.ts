import { refreshAccessToken } from "@/lib/refresh-token"; // adjust path as needed
import { NextResponse } from "next/server";
import fetch from "node-fetch";

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

    // Retrieve Constant Contact list ID from env.
    const LIST_ID = process.env.CONSTANT_CONTACT_MAIN_LIST_ID;
    if (!LIST_ID) {
      return NextResponse.json(
        { success: false, error: "Missing Constant Contact list ID." },
        { status: 500 }
      );
    }

    // Get a valid access token by refreshing it if needed.
    const ACCESS_TOKEN = await refreshAccessToken();

    // Build the minimal payload.
    const payload: ContactPayload = {
      first_name,
      last_name,
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
    return NextResponse.json(
      { success: false, error: "Unknown error occurred." },
      { status: 500 }
    );
  }
}
