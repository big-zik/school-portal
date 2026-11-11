import {
  loginSchema,
  attendanceSchema,
  paymentSchema,
  classSchema,
  messageSchema,
  bookSchema,
} from '../src/lib/validators'

const TEST_UUID_1 = '550e8400-e29b-41d4-a716-446655440000'
const TEST_UUID_2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

describe('loginSchema', () => {
  test('valid email and password passes', () => {
    const result = loginSchema.safeParse({
      email: 'teacher@school.edu',
      password: 'SecurePassword123!',
    })
    expect(result.success).toBe(true)
  })

  test('missing email fails', () => {
    const result = loginSchema.safeParse({
      password: 'SecurePassword123!',
    })
    expect(result.success).toBe(false)
  })

  test('invalid email format fails', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'SecurePassword123!',
    })
    expect(result.success).toBe(false)
  })

  test('missing password fails', () => {
    const result = loginSchema.safeParse({
      email: 'teacher@school.edu',
    })
    expect(result.success).toBe(false)
  })
})

describe('attendanceSchema', () => {
  test('valid batch attendance passes', () => {
    const result = attendanceSchema.safeParse({
      date: '2024-03-15',
      classId: TEST_UUID_1,
      entries: [
        {
          studentId: TEST_UUID_2,
          status: 'PRESENT',
          remarks: 'On time',
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  test('missing classId fails', () => {
    const result = attendanceSchema.safeParse({
      date: '2024-03-15',
      entries: [
        {
          studentId: TEST_UUID_2,
          status: 'PRESENT',
        },
      ],
    })
    expect(result.success).toBe(false)
  })

  test('invalid status fails', () => {
    const result = attendanceSchema.safeParse({
      date: '2024-03-15',
      classId: TEST_UUID_1,
      entries: [
        {
          studentId: TEST_UUID_2,
          status: 'INVALID_STATUS',
        },
      ],
    })
    expect(result.success).toBe(false)
  })
})

describe('paymentSchema', () => {
  test('valid payment passes', () => {
    const result = paymentSchema.safeParse({
      invoiceId: TEST_UUID_1,
      amount: 50000,
      paymentMethod: 'BANK_TRANSFER',
      paymentDate: '2024-03-15',
    })
    expect(result.success).toBe(true)
  })

  test('negative amount fails', () => {
    const result = paymentSchema.safeParse({
      invoiceId: TEST_UUID_1,
      amount: -1000,
      paymentMethod: 'CASH',
      paymentDate: '2024-03-15',
    })
    expect(result.success).toBe(false)
  })

  test('missing invoiceId fails', () => {
    const result = paymentSchema.safeParse({
      amount: 50000,
      paymentMethod: 'CARD',
      paymentDate: '2024-03-15',
    })
    expect(result.success).toBe(false)
  })
})

describe('classSchema', () => {
  test('valid class passes', () => {
    const result = classSchema.safeParse({
      name: 'Grade 10A',
      level: 'Secondary',
      capacity: 35,
    })
    expect(result.success).toBe(true)
  })

  test('name too short (empty string) fails', () => {
    const result = classSchema.safeParse({
      name: '',
      level: 'Secondary',
    })
    expect(result.success).toBe(false)
  })
})

describe('messageSchema', () => {
  test('valid message passes', () => {
    const result = messageSchema.safeParse({
      recipientId: TEST_UUID_1,
      subject: 'Parent-Teacher Meeting',
      content: 'Reminder about tomorrow meeting.',
    })
    expect(result.success).toBe(true)
  })

  test('missing subject fails', () => {
    const result = messageSchema.safeParse({
      recipientId: TEST_UUID_1,
      content: 'Message without subject',
    })
    expect(result.success).toBe(false)
  })
})

describe('bookSchema', () => {
  test('valid book passes', () => {
    const result = bookSchema.safeParse({
      title: 'Advanced Mathematics',
      author: 'John Smith',
      isbn: '9780123456789',
      totalCopies: 5,
    })
    expect(result.success).toBe(true)
  })

  test('invalid ISBN fails', () => {
    const result = bookSchema.safeParse({
      title: 'Advanced Mathematics',
      author: 'John Smith',
      isbn: 'invalid-isbn-123',
      totalCopies: 5,
    })
    expect(result.success).toBe(false)
  })

  test('missing totalCopies fails', () => {
    const result = bookSchema.safeParse({
      title: 'Advanced Mathematics',
      author: 'John Smith',
    })
    expect(result.success).toBe(false)
  })
})
