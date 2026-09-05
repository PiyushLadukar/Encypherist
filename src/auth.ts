import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getCollections } from "@/lib/mongodb";
import { loginSchema } from "@/lib/validation/admin";
import type { AdminRole } from "@/types/models";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: AdminRole;
      isActive: boolean;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: AdminRole;
    isActive: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const { admins } = await getCollections();
        const admin = await admins.findOne({ email });
        if (!admin || !admin.isActive) return null;

        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) return null;

        await admins.updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } });

        return {
          id: admin._id.toHexString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: AdminRole }).role;
        token.isActive = (user as { isActive: boolean }).isActive;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.isActive = token.isActive;
      return session;
    },
  },
});
