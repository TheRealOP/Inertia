# AGENTS.md

## 1. Project Overview
**Scheduler** is an AI-based calendar application and website designed to intelligently manage time, events, and scheduling conflicts.

*   **Core Goal:** Automate scheduling tasks using AI, integrated seamlessly with Google Calendar.
*   **Key Mechanic:** Users authenticate via Google, and the system manages their calendar events, offering AI-driven insights or modifications.

## 2. Agent Roles & Responsibilities

### 🏗️ Build (The Daily Driver)
*   **Role:** Implementation specialist for features, UI components, and API routes.
*   **Focus:** Writing clean, functional React 19 / Next.js 16 code.
*   **Protocol:** Always check `current_flow.md` before starting a task to understand the current state of the application. Prefers small, verifiable iterations.

### 🧠 Build-Deep (The Specialist)
*   **Role:** Deep refactoring, complex logic implementation, and "hard" bug fixing.
*   **Focus:** Complex scheduling algorithms, Prisma/Database optimization, and AI logic integration (Inngest functions).
*   **Protocol:** Use when architectural changes are required or when race conditions/logic errors occur in the scheduling engine.

### 📐 Plan (The Architect)
*   **Role:** Strategist and System Designer.
*   **Focus:** Defining data models, API structures, and integration strategies (e.g., how the AI agent talks to the Google Calendar API).
*   **Protocol:** Calls the **Researcher** to verify documentation for new libraries (Prisma 7, Next 16) before finalizing a plan.

### 🔍 Researcher (The Context Expert)
*   **Role:** Information gatherer.
*   **Focus:** Reading documentation (via `webfetch`) for specific versions (Prisma 7, Next.js 16), mapping file structures, and understanding the dependency graph.
*   **Protocol:** Does **not** edit code. focused solely on providing accurate context to the Build/Plan agents.

### 🧪 Code-Reviewer (The Gatekeeper)
*   **Role:** Quality Assurance and Security.
*   **Focus:** Identifying edge cases (timezones!), logic bugs, security vulnerabilities (auth checks), and enforcing code style.
*   **Protocol:** must run validation on strict types (Zod) and ensure `use client` is used correctly in the Next.js 16 app router context.

### 📚 Vault-Curator (The Librarian)
*   **Role:** Documentation maintainer.
*   **Focus:** Updating `current_flow.md`, `README.md`, and this `AGENTS.md` file.
*   **Protocol:** Ensures that as the schema evolves, the documentation reflects the changes immediately.

## 3. Tech Stack & Project-Specific Conventions

### Core Framework: Next.js 16 & React 19
*   **App Router:** Strict adherence to `src/app/` directory structure.
*   **Server Components:** Default to Server Components. Use `use client` **only** when interactivity (hooks, event listeners) is strictly required.
*   **Data Fetching:** Prefer fetching data directly in Server Components using Prisma.
*   **Runtime:** Note that `src/app/api/auth/[...nextauth]/route.ts` runs on the **Node.js runtime** (compatibility requirement).

### Database: Prisma 7 & Neon (PostgreSQL)
*   **Configuration:** We use **Prisma 7**.
    *   The database URL and configuration are often found in `prisma.config.ts` (or similar config files), not just `schema.prisma`.
*   **Driver:** We use `@prisma/adapter-neon` for serverless WebSocket connections to Neon.
*   **Schema:** `prisma/schema.prisma` is the source of truth for the data model.
*   **Access:** Use `src/lib/prisma.ts` for the singleton client instance. **Do not instantiate new PrismaClients manually.**

### Authentication: NextAuth.js
*   **Provider:** Google OAuth only.
*   **Files:** `src/lib/auth.ts` contains the configuration options. `src/app/api/auth/[...nextauth]/route.ts` is the handler.
*   **Session Management:**
    *   **Server Side:** Use `getServerSession(authOptions)`.
    *   **Client Side:** Use `useSession()` from `next-auth/react`.
    *   **Protection:** Pages requiring auth (like `src/app/protected`) must have server-side checks and redirects.

### Background Jobs: Inngest
*   **Usage:** All AI processing and long-running calendar syncs must be offloaded to Inngest.
*   **Why:** To prevent timeouts on Vercel/Serverless functions.

### Date & Time: Day.js
*   **Rule:** **ALL** internal database storage must be in UTC.
*   **Rule:** Conversion to user local time happens only at the UI layer (Client Components).
*   **Library:** Use `dayjs` for all manipulation.

## 4. File Structure & Location Protocols

*   `src/app/` - App Router pages and layouts.
*   `src/components/` - Reusable UI components.
*   `src/lib/` - Singleton utilities (Prisma, Auth, API wrappers).
*   `src/server/` - (If applicable) Server Actions or Backend logic.
*   `prisma/` - Database schema and migrations.
*   `Documentation for Ojas/` - Main project documentation.

## 5. Tool Usage Protocols

*   **`webfetch`**:
    *   **Mandatory** when using Prisma 7 or Next.js 16 features that may have changed recently. Do not rely solely on training data for these specific versions.
*   **`edit`**:
    *   When editing `tsx` files, pay extreme attention to the imports. Ensure `use client` directives remain at the very top if present.
*   **`bash`**:
    *   **Installation:** Use `npm install`.
    *   **Database:** Use `npx prisma db push` or `migrate dev` (ask Architect).
    *   **Linting:** Run `npm run lint` before confirming a task is done.

## 6. AI & Business Logic Guidelines
1.  **Safety First:** The AI has write access to the user's calendar. All "Create" or "Delete" actions generated by AI should generally require a user confirmation step (UI) unless explicitly defined as "Auto-Pilot" in the spec.
2.  **Privacy:** Do not send PII (Personally Identifiable Information) to LLMs unless strictly necessary for the scheduling context.
3.  **Error Handling:** If Google API fails (token expired), the app must degrade gracefully and prompt the user to re-authenticate.

## 7. Communication & Handoffs
*   When **Plan** hands off to **Build**, provide a specific checklist of files to touch.
*   When **Build** hands off to **Code-Reviewer**, list the manual tests performed (e.g., "Verified Google Login flow works locally").
*   If a library error occurs due to version mismatches (e.g., Prisma adapter issues), call **Researcher** to find the latest fix immediately.

## 8. Code Guidelines
*   **Conciseness & Clarity:** Aim for code changes under 150 lines. All code should be well-commented and documented to ensure clarity for the user and other developers.