// This file runs on the client so we can use NextAuth hooks.
"use client";

import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";

function AuthStatus() {
  // useSession calls /api/auth/session and keeps session state in sync.
  const { data, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  if (data?.user) {
    return (
      <>
        {/* When signed in, show the session's user info and a sign-out button */}
        <p>Signed in as {data.user.email ?? data.user.name}</p>
        <button type="button" onClick={() => signOut()}>
          Sign out
        </button>
      </>
    );
  }

  return (
    <button type="button" onClick={() => signIn("google")}>
      {/* Kicks off the NextAuth Google OAuth flow */}
      Sign in with Google
    </button>
  );
}

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      {/* SessionProvider supplies auth state to useSession() */}
      <SessionProvider>
        <h1>Scheduler</h1>
        <AuthStatus />
      </SessionProvider>
    </main>
  );
}
