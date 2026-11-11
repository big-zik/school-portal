import NextAuth, { type NextAuthConfig, type User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import prisma from '@/lib/db'

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required.')
        }

        const email = (credentials.email as string).toLowerCase().trim()
        const password = credentials.password as string

        const dbUser = await prisma.user.findUnique({
          where: { email },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        })

        if (!dbUser) {
          // Uniform error — do not reveal whether email exists
          throw new Error('Invalid email or password.')
        }

        if (!dbUser.isActive) {
          throw new Error('Your account has been deactivated. Please contact an administrator.')
        }

        // Check account lockout
        if (dbUser.lockedUntil && dbUser.lockedUntil > new Date()) {
          const remaining = Math.ceil(
            (dbUser.lockedUntil.getTime() - Date.now()) / 60_000,
          )
          throw new Error(
            `Account is temporarily locked. Try again in ${remaining} minute${remaining !== 1 ? 's' : ''}.`,
          )
        }

        const passwordValid = await compare(password, dbUser.password)

        if (!passwordValid) {
          const newAttempts = dbUser.loginAttempts + 1
          const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS

          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              loginAttempts: newAttempts,
              ...(shouldLock
                ? { lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS) }
                : {}),
            },
          })

          if (shouldLock) {
            throw new Error(
              `Too many failed attempts. Your account has been locked for 15 minutes.`,
            )
          }

          const remaining = MAX_LOGIN_ATTEMPTS - newAttempts
          throw new Error(
            `Invalid email or password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
          )
        }

        // ✅ Successful login — reset lockout fields and update lastLoginAt
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            loginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        })

        const roles = dbUser.roles.map((r: any) => r.role.name)

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          roles,
        } as unknown as User
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on initial sign-in
      if (user) {
        token.id = user.id as string
        token.email = user.email as string
        token.name = user.name as string
        token.roles = (user as any).roles as string[]
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        ;(session.user as any).roles = token.roles as string[]
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
