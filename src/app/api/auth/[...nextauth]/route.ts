// NextAuth route handler for App Router; serves /api/auth/* endpoints.
import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth";

// Force Node.js runtime so process.env + Prisma adapter are available.
export const runtime = "nodejs";

// NextAuth handler: configures providers and session signing.
const handler = NextAuth(authOptions);

// App Router route handlers for GET/POST auth endpoints.
export { handler as GET, handler as POST };
