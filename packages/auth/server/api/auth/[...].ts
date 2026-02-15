import { NuxtAuthHandler } from "#auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@myturborepo/database";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";

export default NuxtAuthHandler({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NUXT_AUTH_SECRET,

  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/dashboard",
  },

  providers: [
    // Credentials provider (email + password)
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),

    // GitHub OAuth (optional — only if env vars are set)
    ...(process.env.NUXT_OAUTH_GITHUB_CLIENT_ID &&
    process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET
      ? [
          // @ts-expect-error
          GithubProvider.default({
            clientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID,
            clientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET,
          }),
        ]
      : []),

    // Google OAuth (optional — only if env vars are set)
    ...(process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID &&
    process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET
      ? [
          // @ts-expect-error
          GoogleProvider.default({
            clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
            clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
});
