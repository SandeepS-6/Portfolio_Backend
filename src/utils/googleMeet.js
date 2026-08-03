/* Creates a Calendar event with Google Meet when GOOGLE_REFRESH_TOKEN is set. */
import { randomUUID } from "crypto";

async function getAccessToken() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    console.warn("[meet] Google token refresh failed.", data.error || res.status);
    return null;
  }
  return data.access_token;
}

/** Returns { meetUrl, htmlLink } or null. */
export async function createGoogleMeetEvent({
  summary,
  description,
  startAt,
  endAt,
  timeZone,
  guestEmail,
  guestName,
}) {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const event = {
    summary: summary || "Portfolio meeting",
    description: description || "",
    start: {
      dateTime: new Date(startAt).toISOString(),
      timeZone: timeZone || "Asia/Kolkata",
    },
    end: {
      dateTime: new Date(endAt).toISOString(),
      timeZone: timeZone || "Asia/Kolkata",
    },
    attendees: guestEmail
      ? [{ email: guestEmail, displayName: guestName || undefined }]
      : [],
    conferenceData: {
      createRequest: {
        requestId: randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const url =
    "https://www.googleapis.com/calendar/v3/calendars/primary/events" +
    "?conferenceDataVersion=1&sendUpdates=all";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.warn("[meet] Calendar event create failed.", data.error || res.status);
    return null;
  }

  const meetUrl =
    data.hangoutLink ||
    data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")
      ?.uri ||
    null;

  if (!meetUrl) {
    console.warn("[meet] Event created but no Meet link returned.");
    return { meetUrl: null, htmlLink: data.htmlLink || null };
  }

  return { meetUrl, htmlLink: data.htmlLink || null };
}

export function resolveConfiguredMeetUrl(settings = {}) {
  const fromSettings = String(settings.meetUrl || "").trim();
  if (fromSettings) return fromSettings;
  const fromEnv = String(process.env.GOOGLE_MEET_URL || "").trim();
  return fromEnv || null;
}
