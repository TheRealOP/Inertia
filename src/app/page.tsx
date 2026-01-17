import Link from "next/link";

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Scheduler</h1>
      <p>Use the navbar to sign in, then visit the protected page.</p>
      <Link href="/protected">Go to protected page</Link>
    </main>
  );
}
