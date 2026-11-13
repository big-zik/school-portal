import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  // Backward compatibility redirects if any old links hit /auth/*
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
]

const PUBLIC_PREFIXES = ['/api/auth', '/api/public']

const PROTECTED_ROUTES = [
  { prefix: '/super-admin', roles: ['SUPER_ADMIN'] },
  { prefix: '/admin', roles: ['ADMIN', 'SUPER_ADMIN'] },
  { prefix: '/teacher', roles: ['TEACHER'] },
  { prefix: '/parent', roles: ['PARENT'] },
  { prefix: '/student', roles: ['STUDENT'] },
]

const ROLE_DASHBOARD: Record<string, string> = {
  SUPER_ADMIN: '/super-admin',
  ADMIN: '/admin',
  TEACHER: '/teacher',
  PARENT: '/parent',
  STUDENT: '/student',
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuth = !!req.auth?.user

  // Backward compatibility: redirect /auth/* to /*
  if (pathname.startsWith('/auth/')) {
    const canonicalPath = pathname.replace('/auth', '')
    return NextResponse.redirect(new URL(canonicalPath, req.url))
  }

  // 1. Allow public routes
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next()
  }

  // 2. Redirect unauthenticated users
  if (!isAuth) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(loginUrl)
  }

  const userRoles: string[] = (req.auth?.user as any)?.roles ?? []

  // 3. Enforce role-based access control
  for (const route of PROTECTED_ROUTES) {
    if (pathname.startsWith(route.prefix)) {
      const hasRole = route.roles.some((r) => userRoles.includes(r))
      if (!hasRole) {
        const priority = ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT', 'STUDENT']
        const userFirstRole = priority.find((r) => userRoles.includes(r))
        const redirectPath = userFirstRole ? ROLE_DASHBOARD[userFirstRole] : '/login'
        return NextResponse.redirect(new URL(redirectPath, req.url))
      }
      break
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
