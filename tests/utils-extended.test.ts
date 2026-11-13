import {
  cn,
  formatPercentage,
  formatFileSize,
  formatPhoneNumber,
  formatDateForInput,
  getGradeColor,
  getStatusBadgeVariant,
  getStatusLabel,
  capitalize,
  getRoleDashboardUrl,
  getAvatarFallback,
  isValidEmail,
  isValidPhone,
  isValidDate,
  sortBy,
  chunk,
  getLetterGrade,
} from '@/lib/utils'

describe('cn', () => {
  it('merges conflicting tailwind classes, keeping the last', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('drops falsy values', () => {
    expect(cn('a', false && 'b', undefined, null, 'c')).toBe('a c')
  })
})

describe('formatPercentage', () => {
  it('uses one decimal by default', () => {
    expect(formatPercentage(85.678)).toBe('85.7%')
  })

  it('respects a custom decimal count', () => {
    expect(formatPercentage(85.678, 0)).toBe('86%')
  })
})

describe('formatFileSize', () => {
  it.each([
    [0, '0 B'],
    [512, '512 B'],
    [1024, '1.0 KB'],
    [1536, '1.5 KB'],
    [1024 * 1024, '1.0 MB'],
    [5 * 1024 * 1024, '5.0 MB'],
    [1024 ** 3, '1.0 GB'],
  ])('formats %d bytes as %s', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected)
  })
})

describe('formatPhoneNumber', () => {
  it('formats an 11-digit Nigerian number', () => {
    expect(formatPhoneNumber('08012345678')).toBe('0801 234 5678')
  })

  it('formats a 13-digit +234 number', () => {
    expect(formatPhoneNumber('2348012345678')).toBe('+234 801 234 5678')
  })

  it('strips punctuation before formatting', () => {
    expect(formatPhoneNumber('0801-234-5678')).toBe('0801 234 5678')
  })

  it('returns the input unchanged when the length is unrecognised', () => {
    expect(formatPhoneNumber('12345')).toBe('12345')
  })
})

describe('formatDateForInput', () => {
  it('formats an ISO date for an <input type="date">', () => {
    expect(formatDateForInput('2026-03-09')).toBe('2026-03-09')
  })

  it('returns an empty string for an invalid date', () => {
    expect(formatDateForInput('garbage')).toBe('')
  })
})

describe('getGradeColor', () => {
  it.each([
    ['A+', 'text-green-600'],
    ['A', 'text-green-600'],
    ['B', 'text-blue-600'],
    ['C', 'text-yellow-600'],
    ['D', 'text-orange-500'],
    ['F', 'text-red-600'],
    ['a', 'text-green-600'],
  ])('maps grade %s to %s', (grade, cls) => {
    expect(getGradeColor(grade)).toBe(cls)
  })
})

describe('getLetterGrade boundaries', () => {
  it.each([
    [100, 'A+'],
    [90, 'A+'],
    [89, 'A'],
    [80, 'A'],
    [79, 'B'],
    [70, 'B'],
    [69, 'C'],
    [60, 'C'],
    [59, 'D'],
    [50, 'D'],
    [49, 'F'],
    [0, 'F'],
  ])('%d -> %s', (score, grade) => {
    expect(getLetterGrade(score)).toBe(grade)
  })

  it('falls back to F for out-of-range scores', () => {
    expect(getLetterGrade(150)).toBe('F')
    expect(getLetterGrade(-5)).toBe('F')
  })

  it('honours a custom grading scale', () => {
    const scale = [{ minScore: 0, maxScore: 100, letterGrade: 'P' }]
    expect(getLetterGrade(42, scale)).toBe('P')
  })
})

describe('getStatusBadgeVariant', () => {
  it.each(['ACTIVE', 'PAID', 'PRESENT', 'SUBMITTED', 'GRADED', 'RETURNED', 'PROMOTED'])(
    '%s -> default',
    (s) => expect(getStatusBadgeVariant(s)).toBe('default'),
  )

  it.each(['PENDING', 'PARTIAL', 'LATE', 'EXCUSED', 'SICK', 'REPEATED'])('%s -> secondary', (s) =>
    expect(getStatusBadgeVariant(s)).toBe('secondary'),
  )

  it.each(['OVERDUE', 'ABSENT', 'SUSPENDED', 'CANCELLED', 'REJECTED'])('%s -> destructive', (s) =>
    expect(getStatusBadgeVariant(s)).toBe('destructive'),
  )

  it('is case-insensitive', () => {
    expect(getStatusBadgeVariant('paid')).toBe('default')
  })

  it('falls back to outline for unknown statuses', () => {
    expect(getStatusBadgeVariant('MYSTERY')).toBe('outline')
  })
})

describe('getStatusLabel', () => {
  it('returns the mapped label', () => {
    expect(getStatusLabel('SICK')).toBe('Sick Leave')
    expect(getStatusLabel('PARTIAL')).toBe('Partially Paid')
  })

  it('is case-insensitive', () => {
    expect(getStatusLabel('overdue')).toBe('Overdue')
  })

  it('humanises unmapped statuses', () => {
    expect(getStatusLabel('AWAITING_REVIEW')).toBe('Awaiting review')
  })
})

describe('capitalize', () => {
  it('uppercases the first letter only', () => {
    expect(capitalize('hello world')).toBe('Hello world')
  })

  it('returns an empty string for empty input', () => {
    expect(capitalize('')).toBe('')
  })
})

describe('getRoleDashboardUrl', () => {
  it.each([
    [['SUPER_ADMIN'], '/admin'],
    [['ADMIN'], '/admin'],
    [['TEACHER'], '/teacher'],
    [['STUDENT'], '/student'],
    [['PARENT'], '/parent'],
    [['ACCOUNTANT'], '/accountant'],
    [['LIBRARIAN'], '/librarian'],
    [['HOSTEL_STAFF'], '/hostel'],
    [['TRANSPORT_STAFF'], '/transport'],
    [['SUPPORT_STAFF'], '/portal'],
    [[], '/portal'],
  ])('roles %j -> %s', (roles, url) => {
    expect(getRoleDashboardUrl(roles as string[])).toBe(url)
  })

  it('prefers admin over teacher for multi-role users', () => {
    expect(getRoleDashboardUrl(['TEACHER', 'ADMIN'])).toBe('/admin')
  })
})

describe('getAvatarFallback', () => {
  it('returns initials', () => {
    expect(getAvatarFallback('Ngozi Eze')).toBe('NE')
  })

  it('returns an empty string for an empty name', () => {
    expect(getAvatarFallback('')).toBe('')
  })

  it('uses first and last name for three-part names', () => {
    expect(getAvatarFallback('Ada Mary Obi')).toBe('AO')
  })
})

describe('isValidEmail', () => {
  it.each(['a@b.co', ' user@school.com ', 'first.last@sub.domain.org'])('accepts %s', (e) =>
    expect(isValidEmail(e)).toBe(true),
  )

  it.each(['', 'no-at-sign', 'a@b', '@b.com', 'a b@c.com'])('rejects "%s"', (e) =>
    expect(isValidEmail(e)).toBe(false),
  )
})

describe('isValidPhone', () => {
  it('accepts 10 to 15 digits', () => {
    expect(isValidPhone('0801234567')).toBe(true)
    expect(isValidPhone('+234 801 234 5678')).toBe(true)
  })

  it('rejects too short and too long numbers', () => {
    expect(isValidPhone('12345')).toBe(false)
    expect(isValidPhone('1'.repeat(16))).toBe(false)
  })
})

describe('isValidDate', () => {
  it('accepts an ISO date', () => {
    expect(isValidDate('2026-11-13')).toBe(true)
  })

  it('rejects a non-date', () => {
    expect(isValidDate('hello')).toBe(false)
  })

  it('rejects an impossible calendar date', () => {
    expect(isValidDate('2026-02-31')).toBe(false)
  })
})

describe('sortBy', () => {
  const rows = [
    { name: 'Chi', score: 70 },
    { name: 'Ada', score: 90 },
    { name: 'Bayo', score: 80 },
  ]

  it('sorts ascending by default', () => {
    expect(sortBy(rows, 'score').map((r) => r.score)).toEqual([70, 80, 90])
  })

  it('sorts descending', () => {
    expect(sortBy(rows, 'name', 'desc').map((r) => r.name)).toEqual(['Chi', 'Bayo', 'Ada'])
  })

  it('does not mutate the input array', () => {
    const copy = [...rows]
    sortBy(rows, 'score')
    expect(rows).toEqual(copy)
  })
})

describe('chunk edge cases', () => {
  it('throws RangeError for size 0', () => {
    expect(() => chunk([1, 2, 3], 0)).toThrow(RangeError)
  })

  it('throws RangeError for a negative size', () => {
    expect(() => chunk([1, 2, 3], -2)).toThrow(RangeError)
  })

  it('returns an empty array for empty input', () => {
    expect(chunk([], 3)).toEqual([])
  })
})
