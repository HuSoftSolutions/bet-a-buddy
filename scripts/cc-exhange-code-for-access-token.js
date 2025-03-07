import dotenv from "dotenv";
import fetch from "node-fetch";

// Load environment variables from .env.local file
dotenv.config({ path: ".env.local" });

const CLIENT_ID = process.env.CONSTANT_CONTACT_CLIENT_ID;
const CLIENT_SECRET = process.env.CONSTANT_CONTACT_CLIENT_SECRET;
const REDIRECT_URI = process.env.CONSTANT_CONTACT_REDIRECT_URI;

// These values should be retrieved from the OAuth callback URL query parameters
// For example, in an Express route handling GET /callback, you'd get these from req.query
const receivedCode = "5RicdyQij87B-jRLNAC8PDLAYnrT1Q8aXFA-62B63rI"
const receivedState = "zz6zv4w87"; // Replace with the actual state from query parameters

// Suppose you stored the original state in your session; compare it like so:
// if (receivedState !== req.session.originalState) { /* handle error */ }

async function exchangeCodeForToken(authCode) {
  const tokenEndpoint = "https://authz.constantcontact.com/oauth2/default/v1/token";
  
  // Prepare URL-encoded parameters
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("code", authCode);
  params.append("redirect_uri", REDIRECT_URI);

  try {
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error exchanging code for token: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Access Token:", data.access_token);
    console.log("Refresh Token:", data.refresh_token);
    // You can now store these tokens securely for future API requests.
    return data;
  } catch (error) {
    console.error("An error occurred during token exchange:");
    console.error(error instanceof Error ? error.message : error);
  }
}

// Validate state before exchanging code
function validateState(originalState, returnedState) {
  if (originalState !== returnedState) {
    throw new Error("Invalid state parameter. Potential CSRF attack.");
  }
  console.log("State parameter validated successfully.");
}

// Example usage:
// Replace "ORIGINAL_STATE" with the state you originally generated and stored
const ORIGINAL_STATE = "zz6zv4w87";

try {
  validateState(ORIGINAL_STATE, receivedState);
  exchangeCodeForToken(receivedCode);
} catch (error) {
  console.error(error);
}
