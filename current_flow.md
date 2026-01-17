# Current Application Flow

This document outlines the current user and data flow of the Scheduler application.

## 1. Authentication

The application uses NextAuth.js for authentication, configured to use **Google as the primary OAuth provider**.

- **Configuration (`src/lib/auth.ts`):** Defines the NextAuth.js options, including the Google provider and a `PrismaAdapter`. This adapter connects NextAuth.js to the database, allowing it to store user and session information.
- **API Endpoints (`src/app/api/auth/[...nextauth]/route.ts`):** This file creates the API route that handles all authentication requests (e.g., `/api/auth/signin`, `/api/auth/signout`, `/api/auth/session`).

## 2. Application Entrypoint & Structure

- **Root Layout (`src/app/layout.tsx`):** This is the top-level layout that wraps every page in the application. Its main role is to render the `Providers` component.
- **Providers (`src/app/providers.tsx`):** A client-side component that wraps the application in a `SessionProvider`. This makes session data (like the currently logged-in user) available throughout the component tree. It also renders the `Navbar`.

## 3. User Interface & Navigation

- **Navigation Bar (`src/components/navbar.tsx`):** The primary navigation tool for the user.
  - It displays the application title, which links back to the home page.
  - It contains a link to the `/protected` page.
  - It dynamically changes based on the user's authentication status:
    - If the user is signed in, it displays their name/email and a "Sign out" button.
    - If the user is signed out, it displays a "Sign in" button. Clicking this initiates the Google sign-in flow via NextAuth.js.
    - It shows a loading state while checking the session status.

## 4. Page Flows

### a. Home Page (`src/app/page.tsx`)

- This is the main landing page of the application.
- It is a public page that anyone can access.
- It contains a simple welcome message and a link that directs the user to the `/protected` page.

### b. Protected Page (`src/app/protected/page.tsx`)

- This is a server-side rendered page that requires authentication.
- **Authentication Check:** Before rendering, it uses `getServerSession` to check for an active user session.
- **Redirection:** If no session is found (i.e., the user is not logged in), it redirects the user to the default NextAuth.js sign-in page (`/api/auth/signin`).
- **Authenticated Content:** If a session exists, it renders the page and displays a welcome message to the signed-in user.
