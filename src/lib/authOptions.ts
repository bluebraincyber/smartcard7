import type { AuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import pool from '@/lib/db';
import { JWT } from 'next-auth/jwt';

export const authOptions: AuthOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            console.log('No credentials provided');
            return null;
          }

          try {
            const { rows } = await pool.query(
              `SELECT id, email, name, password_hash 
              FROM users 
              WHERE email = $1
              LIMIT 1`, [credentials.email.toLowerCase().trim()]
            );
            
            const user = rows[0];
            if (!user) {
              return null;
            }

            const valid = await compare(credentials.password, user.password_hash);
            if (!valid) {
              return null;
            }

            return { 
              id: String(user.id), 
              name: user.name, 
              email: user.email 
            };
          } catch (error) {
            console.error('Auth error during authorization:', error);
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
      async jwt({ token, user }: { token: JWT, user: any }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      
      async session({ session, token }: { session: Session, token: JWT }) {
        if (session?.user && token?.id) {
          session.user.id = token.id;
        }
        return session;
      },
      async redirect({ url, baseUrl }) {
        // Allows us to redirect to the callbackUrl set in the form
        if (url.startsWith(baseUrl)) {
          return url;
        }
        // Allows relative callback URLs
        if (url.startsWith("/")) {
          return new URL(url, baseUrl).toString();
        }
        return baseUrl;
      },
    },
};