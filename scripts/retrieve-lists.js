import dotenv from "dotenv";
import fetch from "node-fetch";

/*
Available lists: {
  lists: [
    {
      list_id: '5a5b6036-fa13-11ef-87e4-fa163eddb7c0',
      name: 'Main',
      favorite: false,
      created_at: '2025-03-05T22:44:09Z',
      updated_at: '2025-03-05T22:44:09Z'
    },
    {
      list_id: 'd6f5c490-f9cf-11ef-bdea-fa163e6bfa0d',
      name: 'My Contacts',
      favorite: false,
      created_at: '2025-03-05T14:40:53Z',
      updated_at: '2025-03-05T14:40:53Z'
    }
  ]
}
*/

// Load environment variables from .env file
dotenv.config({ path: ".env.local" });

const ACCESS_TOKEN = process.env.CONSTANT_CONTACT_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error(
    "Error: CONSTANT_CONTACT_ACCESS_TOKEN environment variable is not set."
  );
  process.exit(1);
}
const endpoint = "https://api.cc.email/v3/contact_lists";

async function fetchLists() {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error fetching lists: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Available lists:", data);
  } catch (error) {
    console.error("An error occurred while retrieving lists:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unknown error");
    }
  }
}

fetchLists();
