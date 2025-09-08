import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import pool from '@/lib/db';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;

          try {
            const { rows } = await pool.query(
              `SELECT id, email, name, password_hash 
              FROM users 
              WHERE email = $1 
              LIMIT 1`,
              [credentials.email.toLowerCase().trim()]
            );
            
            const user = rows[0];
            if (!user) return null;

            const valid = await compare(credentials.password, user.password_hash);
            if (!valid) return null;

            return { 
              id: String(user.id), 
              name: user.name, 
              email: user.email 
            };
          } catch (error) {
            console.error('Auth error:', error);
            return null;
          }
        },
      }),
    ],
    session: { 
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    pages: {
      signIn: '/auth/login',
      error: '/auth/error',
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      
      async session({ session, token }) {
        if (session?.user) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },
};