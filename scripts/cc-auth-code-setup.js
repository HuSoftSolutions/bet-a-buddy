import dotenv from "dotenv";

dotenv.config({path: ".env.local"});

// Define your constants
const CLIENT_ID = process.env.CONSTANT_CONTACT_CLIENT_ID;
const REDIRECT_URI = process.env.CONSTANT_CONTACT_REDIRECT_URI
const RESPONSE_TYPE = "code";
const SCOPES = "contact_data offline_access";

// Generate a state value
const STATE = Math.random().toString(36).substring(2);
console.log("ORIGINAL STATE:", STATE)

// Construct the base URL and query parameters
const BASE_URL = "https://authz.constantcontact.com/oauth2/default/v1/authorize";

const authUrl = `${BASE_URL}?client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=${RESPONSE_TYPE}` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&state=${encodeURIComponent(STATE)}`;

console.log("Authorization URL:", authUrl);