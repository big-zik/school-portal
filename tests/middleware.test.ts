// Make `auth(handler)` return the handler itself so the middleware logic can be
// invoked directly with a fake request.
jest.mock('@/auth', () => ({
  auth: (handler: unknown) => handler,
}))

import middleware, { config } from '@/middleware'

type FakeReq = {
  nextUrl: URL
  url: string
  auth: { user: { roles?: string[] } } | null
}

const BASE = 'http://localhost:3000'

function request(pathname: string, roles?: string[] | null): FakeReq {
  const url = `${BASE}${pathname}`
  return {
    nextUrl: new URL(url),
    url,
    auth: roles === null ? null : { user: { roles } },
  }
}

const run = (pathname: string, roles?: string[] | null) =>
  (middleware as unknown as (r: FakeReq) => Response)(request(pathname, roles))

const isPassThrough = (res: Response) => res.headers.get('x-middleware-next') === '1'
const redirectTarget = (res: Response) => {
  const loc = res.headers.get('location')
  return loc ? new URL(loc) : null
}

describe('middleware: public routes', () => {
  it.each(['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'])(
    'lets unauthenticated users through to %s',
    (path) => {
      expect(isPassThrough(run(path, null))).toBe(true)
    },
  )

  it.each(['/api/auth/session', '/api/auth/callback/credentials', '/api/public/anything'])(
    'lets unauthenticated users through to %s',
    (path) => {
      expect(isPassThrough(run(path, null))).toBe(true)
    },
  )
})

describe('middleware: legacy /auth/* redirects', () => {
  it('redirects /auth/login to /login', () => {
    const res = run('/auth/login', null)
    expect(redirectTarget(res)?.pathname).toBe('/login')
  })

  it('redirects /auth/forgot-password to /forgot-password', () => {
    expect(redirectTarget(run('/auth/forgot-password', null))?.pathname).toBe('/forgot-password')
  })
})

describe('middleware: unauthenticated access to protected routes', () => {
  it.each(['/admin', '/admin/payroll', '/teacher', '/student/grades', '/parent/fees', '/super-admin', '/api/students'])(
    'redirects %s to /login with a callbackUrl',
    (path) => {
      const target = redirectTarget(run(path, null))
      expect(target?.pathname).toBe('/login')
      expect(target?.searchParams.get('callbackUrl')).toBe(`${BASE}${path}`)
    },
  )
})

describe('middleware: role-based access control', () => {
  it.each([
    ['/super-admin', ['SUPER_ADMIN']],
    ['/super-admin/audit-logs', ['SUPER_ADMIN']],
    ['/admin', ['ADMIN']],
    ['/admin', ['SUPER_ADMIN']],
    ['/admin/payroll', ['ADMIN']],
    ['/teacher/grades', ['TEACHER']],
    ['/parent/fees', ['PARENT']],
    ['/student/cbt', ['STUDENT']],
  ])('allows %s for roles %j', (path, roles) => {
    expect(isPassThrough(run(path, roles))).toBe(true)
  })

  it('redirects a student away from /admin/payroll to /student', () => {
    expect(redirectTarget(run('/admin/payroll', ['STUDENT']))?.pathname).toBe('/student')
  })

  it('redirects a teacher away from /admin to /teacher', () => {
    expect(redirectTarget(run('/admin', ['TEACHER']))?.pathname).toBe('/teacher')
  })

  it('redirects a parent away from /teacher to /parent', () => {
    expect(redirectTarget(run('/teacher/grades', ['PARENT']))?.pathname).toBe('/parent')
  })

  it('redirects a plain ADMIN away from /super-admin to /admin', () => {
    expect(redirectTarget(run('/super-admin', ['ADMIN']))?.pathname).toBe('/admin')
  })

  it('redirects a student away from /parent to /student', () => {
    expect(redirectTarget(run('/parent/fees', ['STUDENT']))?.pathname).toBe('/student')
  })

  it('sends a user with no recognised role to /login', () => {
    expect(redirectTarget(run('/admin', ['LIBRARIAN']))?.pathname).toBe('/login')
  })

  it('sends a user with an empty roles list to /login', () => {
    expect(redirectTarget(run('/admin', []))?.pathname).toBe('/login')
  })

  it('treats a missing roles field as no roles', () => {
    expect(redirectTarget(run('/student', undefined))?.pathname).toBe('/login')
  })

  it('uses the highest-priority role when redirecting a multi-role user', () => {
    // TEACHER + PARENT trying /admin -> teacher dashboard (priority order)
    expect(redirectTarget(run('/admin', ['PARENT', 'TEACHER']))?.pathname).toBe('/teacher')
  })

  it('lets a multi-role user into any area that one of their roles covers', () => {
    expect(isPassThrough(run('/parent/fees', ['TEACHER', 'PARENT']))).toBe(true)
  })

  it('lets any authenticated user reach unlisted routes', () => {
    expect(isPassThrough(run('/some-shared-page', ['STUDENT']))).toBe(true)
  })

  it('lets authenticated users through to API routes outside the role prefixes', () => {
    expect(isPassThrough(run('/api/students', ['STUDENT']))).toBe(true)
  })
})

describe('middleware matcher config', () => {
  const pattern = new RegExp(`^${config.matcher[0]}$`)

  it.each(['/admin', '/login', '/api/students'])('runs on %s', (path) => {
    expect(pattern.test(path)).toBe(true)
  })

  it.each(['/_next/static/chunk.js', '/_next/image', '/favicon.ico', '/logo.png', '/hero.webp'])(
    'skips %s',
    (path) => {
      expect(pattern.test(path)).toBe(false)
    },
  )
})
