// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" }, // Wichtig für Credentials!
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Passwort", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        console.log("--- LOGIN DEBUG START ---");
        console.log("Input Email:", credentials.email);
        console.log("Input Password:", credentials.password);

        // 1. User in der Datenbank suchen
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        if (!user) {
            console.log("❌ FEHLER: User nicht in DB gefunden!");
            return null;
        } else {
            console.log("✅ User gefunden:", user.email);
            console.log("Gespeicherter Hash:", user.password);
        }

        // 2. Passwort mit bcrypt vergleichen
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        console.log("Passwort-Vergleich Ergebnis:", isPasswordCorrect);

        if (!isPasswordCorrect) {
            console.log("❌ FEHLER: Passwort stimmt nicht überein!");
            return null;
        }

        console.log("✅ LOGIN ERFOLGREICH!");
        console.log("--- LOGIN DEBUG END ---");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    // Schreibt die User-ID in das Session-Objekt, damit wir sie in page.tsx nutzen können
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

