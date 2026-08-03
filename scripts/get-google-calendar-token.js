/**
 * One-time: get GOOGLE_REFRESH_TOKEN for unique Meet links per booking.
 *
 * Before running:
 * 1. Google Cloud Console → enable "Google Calendar API"
 * 2. OAuth client → Authorized redirect URIs → add:
 *    http://localhost:53682/oauth2callback
 * 3. Run:  node scripts/get-google-calendar-token.js
 * 4. Sign in with the Gmail that hosts meetings
 * 5. Paste the printed token into backend/.env as GOOGLE_REFRESH_TOKEN=
 */
import "dotenv/config";
import http from "http";
import { exec } from "child_process";

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPE = [
  "https://www.googleapis.com/auth/calendar.events",
].join(" ");

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env");
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
  });

function openBrowser(url) {
  const platform = process.platform;
  const cmd =
    platform === "win32"
      ? `start "" "${url}"`
      : platform === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname !== "/oauth2callback") {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const error = url.searchParams.get("error");
    if (error) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end(`Auth failed: ${error}`);
      console.error("Auth failed:", error);
      server.close();
      process.exit(1);
    }

    const code = url.searchParams.get("code");
    if (!code) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Missing code");
      return;
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(JSON.stringify(tokens, null, 2));
      console.error("Token exchange failed:", tokens);
      server.close();
      process.exit(1);
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      "<h1>Connected</h1><p>You can close this tab and return to the terminal.</p>",
    );

    console.log("\n--- copy into backend/.env ---\n");
    if (tokens.refresh_token) {
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    } else {
      console.log(
        "No refresh_token returned. Revoke app access at",
        "https://myaccount.google.com/permissions then run again with prompt=consent.",
      );
      console.log("Response keys:", Object.keys(tokens));
    }
    console.log("\n------------------------------\n");

    server.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end("Error");
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log("\n1) Confirm Calendar API is enabled in Google Cloud.");
  console.log(`2) Redirect URI must include: ${REDIRECT_URI}`);
  console.log("3) Browser will open — sign in with your meeting Gmail.\n");
  console.log("Auth URL:\n", authUrl, "\n");
  openBrowser(authUrl);
});
