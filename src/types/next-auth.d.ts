import { DefaultSession } from 'next-auth'
import { UserRole } from '@/types'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    roles: UserRole[]
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      roles: UserRole[]
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string
    roles: UserRole[]
  }
}
