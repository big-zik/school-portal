import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from '../src/lib/validators'

describe('Zod Validation Schemas', () => {
  test('loginSchema validates proper emails and passwords', () => {
    const valid = loginSchema.safeParse({
      email: 'student.daniel@school.com',
      password: 'Password@123',
    })
    expect(valid.success).toBe(true)

    const invalidEmail = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'Password@123',
    })
    expect(invalidEmail.success).toBe(false)
  })

  test('registerSchema requires strong password complexity and matching confirmation', () => {
    const matching = registerSchema.safeParse({
      name: 'Daniel Johnson',
      email: 'daniel@example.com',
      password: 'Password@123',
      confirmPassword: 'Password@123',
    })
    expect(matching.success).toBe(true)

    const mismatched = registerSchema.safeParse({
      name: 'Daniel Johnson',
      email: 'daniel@example.com',
      password: 'Password@123',
      confirmPassword: 'DifferentPassword@123',
    })
    expect(mismatched.success).toBe(false)

    const weakPassword = registerSchema.safeParse({
      name: 'Daniel Johnson',
      email: 'daniel@example.com',
      password: 'weak',
      confirmPassword: 'weak',
    })
    expect(weakPassword.success).toBe(false)
  })

  test('forgotPasswordSchema validates email format', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'valid@school.com' }).success).toBe(true)
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false)
  })
})
