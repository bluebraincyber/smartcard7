import pool from '@/lib/db';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
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
            console.log('Attempting to authenticate user:', credentials.email);
            console.log('Credentials received:', credentials);
            const { rows } = await pool.query(
              `SELECT id, email, name, password_hash 
              FROM users 
              WHERE email = $1
              LIMIT 1`, [credentials.email.toLowerCase().trim()]
            );
            console.log('Database query result:', rows);
            
            const user = rows[0];
            console.log('User object from DB:', user);
            if (!user) {
              console.log('User not found for email:', credentials.email);
              return null;
            }
            console.log('User found:', user.email);

            const valid = await compare(credentials.password, user.password_hash);
            if (!valid) {
              console.log('Invalid password for user:', user.email);
              return null;
            }
            console.log('Password valid for user:', user.email);

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
      async jwt({ token, user }: { token: any, user: any }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      
      async session({ session, token }: { session: any, token: any }) {
        if (session?.user) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },
};