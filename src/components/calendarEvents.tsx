"use client";

import { useEffect, useState } from "react";

type CalendarEvent = {
  id?: string | null;
  summary?: string | null;
  start?: { dateTime?: string | null; date?: string | null } | null;
  end?: { dateTime?: string | null; date?: string | null } | null;
};

export function CalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        const response = await fetch("/api/calendar/events");
        const payload = (await response.json()) as {
          events?: CalendarEvent[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load events");
        }

        if (isMounted) {
          setEvents(payload.events ?? []);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Unknown error";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <p>Loading calendar events...</p>;
  }

  if (error) {
    return <p>Calendar error: {error}</p>;
  }

  if (!events.length) {
    return <p>No upcoming events found.</p>;
  }

  return (
    <section>
      <h2>Upcoming events</h2>
      <ul>
        {events.map((event) => {
          const start = event.start?.dateTime ?? event.start?.date;
          return (
            <li key={event.id ?? `${event.summary}-${start}`}>
              {event.summary ?? "(Untitled)"}
              {start ? ` — ${new Date(start).toLocaleString()}` : ""}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
