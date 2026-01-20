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

  const { access_token, expiry_date } = oauth2Client.credentials;
  const expiresAt = expiry_date ? Math.floor(expiry_date / 1000) : null;

  if (
    access_token &&
    (access_token !== account.access_token || expiresAt !== account.expires_at)
  ) {
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token,
        expires_at: expiresAt,
      },
    });
  }

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

function normalizeEventTimes(event: {
  start?: { dateTime?: string | null; date?: string | null } | null;
  end?: { dateTime?: string | null; date?: string | null } | null;
}) {
  const startDateTime = event.start?.dateTime ?? null;
  const endDateTime = event.end?.dateTime ?? null;
  const startDate = event.start?.date ?? null;
  const endDate = event.end?.date ?? null;

  const allDay = Boolean(startDate || endDate);

  return {
    allDay,
    startTime: startDateTime ? new Date(startDateTime) : null,
    endTime: endDateTime ? new Date(endDateTime) : null,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  };
}

export async function syncGoogleCalendarsByEmail(email: string) {
  const { oauth2Client, userId } = await getGoogleOAuthClientByEmail(email);
  const calendarApi = google.calendar({ version: "v3", auth: oauth2Client });

  const calendars = [];
  let pageToken: string | undefined;

  do {
    const response = await calendarApi.calendarList.list({ pageToken });
    calendars.push(...(response.data.items ?? []));
    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  let calendarsUpserted = 0;
  let eventsUpserted = 0;

  for (const calendar of calendars) {
    if (!calendar.id) {
      continue;
    }

    const storedCalendar = await prisma.calendar.upsert({
      where: {
        userId_provider_providerCalendarId: {
          userId,
          provider: "google",
          providerCalendarId: calendar.id,
        },
      },
      create: {
        userId,
        provider: "google",
        providerCalendarId: calendar.id,
        summary: calendar.summary ?? null,
        timeZone: calendar.timeZone ?? null,
        accessRole: calendar.accessRole ?? null,
      },
      update: {
        summary: calendar.summary ?? null,
        timeZone: calendar.timeZone ?? null,
        accessRole: calendar.accessRole ?? null,
      },
    });

    calendarsUpserted += 1;

    let eventsPageToken: string | undefined;
    do {
      const eventsResponse = await calendarApi.events.list({
        calendarId: calendar.id,
        maxResults: 250,
        singleEvents: true,
        orderBy: "updated",
        pageToken: eventsPageToken,
      });

      const events = eventsResponse.data.items ?? [];

      for (const event of events) {
        if (!event.id) {
          continue;
        }

        const normalizedTimes = normalizeEventTimes(event);

        await prisma.calendarEvent.upsert({
          where: {
            calendarId_providerEventId: {
              calendarId: storedCalendar.id,
              providerEventId: event.id,
            },
          },
          create: {
            calendarId: storedCalendar.id,
            providerEventId: event.id,
            status: event.status ?? null,
            summary: event.summary ?? null,
            description: event.description ?? null,
            location: event.location ?? null,
            providerUpdatedAt: event.updated ? new Date(event.updated) : null,
            ...normalizedTimes,
          },
          update: {
            status: event.status ?? null,
            summary: event.summary ?? null,
            description: event.description ?? null,
            location: event.location ?? null,
            providerUpdatedAt: event.updated ? new Date(event.updated) : null,
            ...normalizedTimes,
          },
        });

        eventsUpserted += 1;
      }

      eventsPageToken = eventsResponse.data.nextPageToken ?? undefined;
    } while (eventsPageToken);
  }

  return { calendarsUpserted, eventsUpserted };
}
