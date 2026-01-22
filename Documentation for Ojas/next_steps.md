# Next Steps for Scheduler Project

This document outlines the immediate next steps and a phased approach for integrating Google Calendar and establishing the AI agent architecture.

## Current Status & Immediate Action: Sync Verification

Before proceeding, the most crucial next step is to manually verify the Google Calendar synchronization.

### 1. Sync Verification (Action Required from User)

*   **Task:** Run the provided verification script `src/temp/verifySync.ts`.
*   **Instructions:**
    1.  **Install `ts-node` globally** (if you haven't already):
        ```bash
        npm install -g ts-node
        ```
    2.  **Open `src/temp/verifySync.ts`** and **replace `'YOUR_TEST_USER_EMAIL@example.com'`** with the email address of a user who has already linked their Google account through your application.
    3.  **Execute the script** from your terminal in the project root:
        ```bash
        npx ts-node src/temp/verifySync.ts
        ```
*   **Expected Output:** The script should indicate successful synchronization and report the number of calendars and events upserted.
*   **Verification:** After running, please check your database directly to confirm the entries in the `Calendar` and `CalendarEvent` tables.
*   **Once complete, please provide the script's output and confirm database verification.**

## Phase 1: Solidify Google Calendar Sync (Core for Proactive Agent)

*Note: These steps will be initiated *after* successful Sync Verification.*

### 2. Inngest Setup for Automated Sync
*   **Task:** Implement an **Inngest** background function (`calendar/sync`) that will periodically call the `syncGoogleCalendarsByEmail` utility.
*   **Purpose:** This will automate the process of keeping the local database in sync with Google Calendar, providing up-to-date data for the AI agents.
*   **Frequency:** Start with a reasonable polling interval (e.g., every 10-15 minutes), keeping in mind potential API rate limits and user experience.
*   **Location:** `src/inngest/functions/calendar.ts` or similar.

### 3. Conflict Detection Pre-processing
*   **Task:** Develop a logic layer (e.g., a utility function or an Inngest step) that scans the `CalendarEvent` table for overlapping events or other predefined scheduling conflicts.
*   **Output:** This process should identify conflicts and potentially store them in a new database table (e.g., `ConflictReport`) or as flags on `CalendarEvent` records. This data will feed the "Proactive Agent."

## Phase 2: AI Agent Architecture

*Note: These steps will be initiated *after* Phase 1 is complete and verified.*

### 1. The Proactive Agent (The "Overseer")
*   **Trigger:** New calendar sync data or a scheduled Inngest job (e.g., daily scan).
*   **Responsibility:** Analyze the synced schedule for specific insights:
    *   Detect conflicts (from Phase 1, Step 3).
    *   Identify "dead time" or opportunities for focused work.
    *   Flag double-bookings or events requiring attention.
*   **Action:** Generate "AI Insights" or "Suggested Resolutions" and store them in the database, potentially linked to user notifications.

### 2. The Reactive Agent (The "Assistant")
*   **Trigger:** User input via a UI (Natural Language Queries).
*   **Responsibility:** Respond to user queries about their schedule, or execute commands.
*   **Examples:**
    *   "What does my Tuesday look like?"
    *   "Find 2 hours for deep work tomorrow afternoon."
    *   "Reschedule my meeting with John from 3 PM to 4 PM."
*   **Action:**
    *   Query the local database for schedule information.
    *   Make API calls to Google Calendar (using the `googleapis` client) to modify events if a user command is given.
    *   Update the local database after external changes.

### Future Considerations:
*   **Error Handling:** Implement robust error handling for Google API failures and token expiration, including user re-authentication flows.
*   **User Interface:** Develop UI components for displaying synced calendar events, AI insights, and the reactive agent's chat interface.
*   **Google Cloud Console:** Ensure the Google Cloud Project's "Authorized redirect URIs" include `YOUR_APP_URL/api/auth/callback/google` to prevent authentication issues.