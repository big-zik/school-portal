import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '@/lib/validators'

const STRONG = 'Str0ng!Pass'

describe('registerSchema', () => {
  const valid = {
    name: 'Ada Obi',
    email: 'ADA@School.com',
    password: STRONG,
    confirmPassword: STRONG,
  }

  it('accepts a valid registration and lowercases the email', () => {
    const res = registerSchema.safeParse(valid)
    expect(res.success).toBe(true)
    if (res.success) expect(res.data.email).toBe('ada@school.com')
  })

  it('rejects a name shorter than 2 characters', () => {
    expect(registerSchema.safeParse({ ...valid, name: 'A' }).success).toBe(false)
  })

  it('rejects a name longer than 100 characters', () => {
    expect(registerSchema.safeParse({ ...valid, name: 'a'.repeat(101) }).success).toBe(false)
  })

  it('rejects an invalid email', () => {
    expect(registerSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false)
  })

  it.each([
    ['too short', 'Ab1!'],
    ['no uppercase letter', 'weakpass1!'],
    ['no number', 'NoNumber!!'],
    ['no special character', 'NoSpecial11'],
  ])('rejects a password that is %s', (_label, password) => {
    const res = registerSchema.safeParse({ ...valid, password, confirmPassword: password })
    expect(res.success).toBe(false)
  })

  it('rejects mismatched passwords and reports the error on confirmPassword', () => {
    const res = registerSchema.safeParse({ ...valid, confirmPassword: 'Different1!' })
    expect(res.success).toBe(false)
    if (!res.success) {
      const issue = res.error.issues.find((i) => i.path.includes('confirmPassword'))
      expect(issue?.message).toBe('Passwords do not match')
    }
  })

  it('rejects a missing confirmPassword', () => {
    const { confirmPassword: _omit, ...rest } = valid
    expect(registerSchema.safeParse(rest).success).toBe(false)
  })
})

describe('forgotPasswordSchema', () => {
  it('accepts a valid email and normalises case', () => {
    const res = forgotPasswordSchema.safeParse({ email: 'Parent@Example.COM' })
    expect(res.success).toBe(true)
    if (res.success) expect(res.data.email).toBe('parent@example.com')
  })

  it('rejects an empty email', () => {
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false)
  })

  it('rejects a missing email', () => {
    expect(forgotPasswordSchema.safeParse({}).success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  const valid = { token: 'abc123', password: STRONG, confirmPassword: STRONG }

  it('accepts a valid reset payload', () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects an empty token', () => {
    expect(resetPasswordSchema.safeParse({ ...valid, token: '' }).success).toBe(false)
  })

  it('rejects a weak new password', () => {
    const res = resetPasswordSchema.safeParse({ ...valid, password: 'weak', confirmPassword: 'weak' })
    expect(res.success).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    expect(resetPasswordSchema.safeParse({ ...valid, confirmPassword: 'Other1!aa' }).success).toBe(false)
  })
})

describe('changePasswordSchema', () => {
  const valid = {
    currentPassword: 'OldPass1!',
    password: STRONG,
    confirmPassword: STRONG,
  }

  it('accepts a valid password change', () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a missing current password', () => {
    expect(changePasswordSchema.safeParse({ ...valid, currentPassword: '' }).success).toBe(false)
  })

  it('rejects a new password identical to the current one', () => {
    const res = changePasswordSchema.safeParse({
      currentPassword: STRONG,
      password: STRONG,
      confirmPassword: STRONG,
    })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues.some((i) => i.message === 'New password must differ from current password')).toBe(true)
    }
  })

  it('rejects mismatched confirmation', () => {
    expect(changePasswordSchema.safeParse({ ...valid, confirmPassword: 'Nope1!aaa' }).success).toBe(false)
  })
})
