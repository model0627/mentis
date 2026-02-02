import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Okta from "next-auth/providers/okta";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...(process.env.AUTH_OKTA_ISSUER
      ? [
          Okta({
            clientId: process.env.AUTH_OKTA_ID,
            clientSecret: process.env.AUTH_OKTA_SECRET,
            issuer: process.env.AUTH_OKTA_ISSUER,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;

        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

          if (!user || !user.passwordHash) return null;

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
      }
      // Refresh role from DB (only runs in Node.js runtime, not Edge middleware)
      if (token.id) {
        try {
          const [dbUser] = await db
            .select({ role: users.role, isActive: users.isActive })
            .from(users)
            .where(eq(users.id, token.id));
          if (dbUser && dbUser.isActive) {
            token.role = dbUser.role;
          } else if (dbUser && !dbUser.isActive) {
            return {};
          }
        } catch {
          // keep existing token on error
        }
      }
      return token;
    },
    async signIn({ user, account }) {
      if (account?.provider === "okta") {
        const email = user.email!;
        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (!existing) {
          const [newUser] = await db
            .insert(users)
            .values({
              email,
              name: user.name,
              image: user.image,
              provider: "okta",
              providerId: account.providerAccountId,
            })
            .returning();
          user.id = newUser.id;
        } else {
          // Block inactive users from signing in
          if (!existing.isActive) return false;
          user.id = existing.id;
        }
      }
      if (account?.provider === "credentials") {
        // Check isActive for credentials login
        const [dbUser] = await db
          .select({ isActive: users.isActive })
          .from(users)
          .where(eq(users.email, user.email!));
        if (dbUser && !dbUser.isActive) return false;
      }
      return true;
    },
  },
});
