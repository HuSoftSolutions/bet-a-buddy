import { adminFirestore } from "@/firebase/admin";

/**
 * Refreshes the Constant Contact access token if expired (or nearly expired)
 * and updates Firestore with the new token and expiry.
 * Returns a valid access token.
 */
export async function refreshAccessToken(): Promise<string> {
	const db = adminFirestore;
  const tokenDocRef = db.collection("constantContact").doc("tokens");
  const tokenDoc = await tokenDocRef.get();

  if (!tokenDoc.exists) {
    throw new Error("Token document does not exist.");
  }

  const tokenData = tokenDoc.data();
  const now = Date.now();

  // If token is still valid (with a 1-minute buffer), return it.
  if (tokenData && tokenData.expires_at && tokenData.expires_at > now + 60 * 1000) {
    return tokenData.access_token;
  }

  if (!tokenData) throw new Error("Failed to retrieve tokenData.");

  const refreshToken = tokenData.refresh_token;
  const clientId = process.env.CONSTANT_CONTACT_CLIENT_ID;
  const clientSecret = process.env.CONSTANT_CONTACT_CLIENT_SECRET;

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("client_id", clientId!);
  params.append("client_secret", clientSecret!);
  params.append("refresh_token", refreshToken);

  const res = await fetch("https://authz.constantcontact.com/oauth2/default/v1/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to refresh token: ${errorText}`);
  }

  const data = await res.json();
  const expires_at = now + data.expires_in * 1000; // data.expires_in is in seconds

  // Update Firestore with the new tokens.
  await tokenDocRef.set({
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_at,
  });

  return data.access_token;
}
