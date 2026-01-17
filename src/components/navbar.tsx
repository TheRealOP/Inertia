"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export function Navbar() {
  const { data, status } = useSession();

  return (
    <nav style={{ padding: 16, borderBottom: "1px solid #e5e5e5" }}>
      <Link href="/">Scheduler</Link>
      <span style={{ marginLeft: 12 }}>
        <Link href="/protected">Protected</Link>
      </span>
      <span style={{ marginLeft: 12 }}>
        {status === "loading" && "Checking session..."}
        {status !== "loading" && data?.user && (
          <>
            Signed in as {data.user.email ?? data.user.name}
            <button type="button" onClick={() => signOut()} style={{ marginLeft: 8 }}>
              Sign out
            </button>
          </>
        )}
        {status !== "loading" && !data?.user && (
          <button type="button" onClick={() => signIn("google")}>
            Sign in
          </button>
        )}
      </span>
    </nav>
  );
}
