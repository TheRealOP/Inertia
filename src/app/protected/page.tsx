import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Protected</h1>
      <p>Welcome, {session.user.email ?? session.user.name}.</p>
    </main>
  );
}
