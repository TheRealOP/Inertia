import { syncGoogleCalendarsByEmail } from "@/lib/googleCalendar";
import { prisma } from "@/lib/prisma";

/**
 * This script is for manually verifying the Google Calendar synchronization.
 *
 * IMPORTANT: Before running:
 * 1. Ensure you have a user account linked with Google Calendar in your database.
 * 2. Replace 'YOUR_TEST_USER_EMAIL@example.com' with the actual email of your test user.
 * 3. Ensure your environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are correctly set.
 *
 * To run this script:
 * 1. Make sure your database is running and accessible.
 * 2. Transpile and run with ts-node or a similar setup:
 *    `npx ts-node src/temp/verifySync.ts`
 *    (You might need to install `ts-node` globally: `npm install -g ts-node`)
 */
async function main() {
  const testUserEmail = "YOUR_TEST_USER_EMAIL@example.com"; // <-- REPLACE THIS WITH A REAL USER'S EMAIL

  console.log(`Attempting to sync Google Calendars for user: ${testUserEmail}`);

  try {
    const result = await syncGoogleCalendarsByEmail(testUserEmail);
    console.log("Synchronization successful!");
    console.log(`Calendars upserted: ${result.calendarsUpserted}`);
    console.log(`Events upserted: ${result.eventsUpserted}`);
    console.log("Please check your database to verify the entries in 'Calendar' and 'CalendarEvent' tables.");
  } catch (error) {
    console.error("Synchronization failed:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      if (error.message.includes("Missing refresh token")) {
        console.error("ACTION REQUIRED: The user needs to re-authenticate with Google, ensuring 'consent' is granted to obtain a refresh token.");
      } else if (error.message.includes("User not found")) {
        console.error("ACTION REQUIRED: Ensure the provided email exists in the User table.");
      } else if (error.message.includes("Google account not linked")) {
        console.error("ACTION REQUIRED: Ensure the user has linked their Google account via NextAuth.js.");
      }
    }
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
