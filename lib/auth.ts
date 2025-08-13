import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'viewer'
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const db = getDb()
        if (!db) {
          console.error('Database connection failed')
          return null
        }

        try {
          // Buscar usuário no banco
          const users = await db(
            'SELECT id, email, name, password_hash, role, is_active FROM users WHERE email = $1',
            [credentials.email]
          )

          if (!users || users.length === 0) {
            return null
          }

          const user = users[0]

          // Verificar se o usuário está ativo
          if (!user.is_active) {
            return null
          }

          // Verificar senha
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isPasswordValid) {
            // Log tentativa de login falhada
            await db(
              `INSERT INTO auth_logs (user_id, action, created_at) 
               VALUES ($1, 'login_failed', NOW())`,
              [user.id]
            )
            return null
          }

          // Atualizar último login
          await db(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
          )

          // Log login bem-sucedido
          await db(
            `INSERT INTO auth_logs (user_id, action, created_at) 
             VALUES ($1, 'login', NOW())`,
            [user.id]
          )

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as User).role
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET || 'sei-manager-secret-key-change-in-production'
}