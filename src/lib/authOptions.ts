import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import pool from '@/lib/db';
import PostgresAdapter from "@auth/pg-adapter";

export const authOptions = {
    adapter: PostgresAdapter(pool),
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
      maxAge: 30 * 24 * 60 * 60, // 30 dias
    },
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    trustHost: true,
    pages: {
      signIn: '/auth/login',
      error: '/auth/error',
    },
    callbacks: {
      async jwt({ token, user, trigger, session }) {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
        }
        
        // Atualizar token se o session update for triggado
        if (trigger === "update" && session) {
          token = { ...token, ...session };
        }
        
        return token;
      },
      
      async session({ session, token }) {
        if (session?.user) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
        }
        return session;
      },
      
      async redirect({ url, baseUrl }) {
        // Corrigir URLs relativas
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`;
        }
        
        // Permitir callback URLs do mesmo host
        try {
          const urlObj = new URL(url);
          const baseUrlObj = new URL(baseUrl);
          
          if (urlObj.hostname === baseUrlObj.hostname) {
            return url;
          }
        } catch {
          // Se a URL for inválida, redirecionar para o dashboard
          return `${baseUrl}/dashboard`;
        }
        
        // Default: redirecionar para o dashboard
        return `${baseUrl}/dashboard`;
      },
    },
    
    events: {
      async signIn() {
        // Log de sign in bem-sucedido
        console.log('User signed in successfully');
      },
      async signOut() {
        // Log de sign out
        console.log('User signed out');
      },
    },
    
    // Habilita debug exceto em produção (alinhado ao novidades.md)
    debug: process.env.NODE_ENV !== 'production'
};