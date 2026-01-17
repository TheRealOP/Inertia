// NextAuth route handler for App Router; serves /api/auth/* endpoints.
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Read OAuth credentials from env; NextAuth uses these to talk to Google.
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Fail fast so we don't boot with a misconfigured auth setup.
if (!clientId || !clientSecret) {
  throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
}

// NextAuth handler: configures providers and session signing.
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId,
      clientSecret,
    }),
  ],
  // Used to sign/encrypt auth cookies and tokens.
  secret: process.env.NEXTAUTH_SECRET,
});

// App Router route handlers for GET/POST auth endpoints.
export { handler as GET, handler as POST };
