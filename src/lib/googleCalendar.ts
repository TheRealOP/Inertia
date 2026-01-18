import { google } from "googleapis";

import { prisma } from "@/lib/prisma";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
}

export async function getGoogleOAuthClientByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const account = await prisma.account.findFirst({
    where: { userId: user.id, provider: "google" },
  });

  if (!account) {
    throw new Error("Google account not linked");
  }

  if (!account.refresh_token) {
    throw new Error("Missing refresh token; re-auth with Google consent");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

  oauth2Client.setCredentials({
    access_token: account.access_token ?? undefined,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  // Ensure an access token is available or refreshed before use.
  await oauth2Client.getAccessToken();

  return { oauth2Client, userId: user.id };
}

export async function listUpcomingEvents(email: string) {
  const { oauth2Client } = await getGoogleOAuthClientByEmail(email);
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  return response.data.items ?? [];
}
