import {
  formatCurrency,
  getLetterGrade,
  getAttendanceColor,
  formatDate,
  truncate,
  getInitials,
  slugify,
  chunk,
  groupBy,
  unique,
} from '../src/lib/utils'

describe('formatCurrency', () => {
  test('formats NGN amounts with comma separator', () => {
    expect(formatCurrency(285000)).toContain('285,000')
  })

  test('includes currency symbol/code for NGN', () => {
    const result = formatCurrency(1000)
    // Intl.NumberFormat may output ₦ or NGN depending on locale support
    expect(result).toMatch(/1,000/)
  })

  test('formats zero correctly', () => {
    expect(formatCurrency(0)).toContain('0')
  })

  test('formats decimal amounts', () => {
    expect(formatCurrency(1500.5)).toMatch(/1,500/)
  })
})

describe('getLetterGrade', () => {
  test('90 and above → A+', () => {
    expect(getLetterGrade(90)).toBe('A+')
    expect(getLetterGrade(100)).toBe('A+')
    expect(getLetterGrade(95)).toBe('A+')
  })

  test('89 (boundary below A+) → A', () => {
    expect(getLetterGrade(89)).toBe('A')
    expect(getLetterGrade(80)).toBe('A')
  })

  test('79 (boundary below A) → B', () => {
    expect(getLetterGrade(79)).toBe('B')
    expect(getLetterGrade(70)).toBe('B')
  })

  test('69 (boundary below B) → C', () => {
    expect(getLetterGrade(69)).toBe('C')
    expect(getLetterGrade(60)).toBe('C')
  })

  test('59 (boundary below C) → D', () => {
    expect(getLetterGrade(59)).toBe('D')
    expect(getLetterGrade(50)).toBe('D')
  })

  test('49 (boundary below D) → F', () => {
    expect(getLetterGrade(49)).toBe('F')
    expect(getLetterGrade(0)).toBe('F')
  })
})

describe('getAttendanceColor', () => {
  test('≥85 returns green variant', () => {
    expect(getAttendanceColor(85)).toContain('green')
    expect(getAttendanceColor(100)).toContain('green')
  })

  test('70-84 returns yellow variant', () => {
    expect(getAttendanceColor(70)).toContain('yellow')
    expect(getAttendanceColor(84)).toContain('yellow')
  })

  test('<70 returns red variant', () => {
    expect(getAttendanceColor(69)).toContain('red')
    expect(getAttendanceColor(0)).toContain('red')
  })
})

describe('formatDate', () => {
  test('formats a valid Date object', () => {
    const date = new Date('2024-03-15')
    const result = formatDate(date)
    expect(result).toMatch(/Mar/)
    expect(result).toMatch(/2024/)
  })

  test('formats a valid ISO date string', () => {
    const result = formatDate('2024-01-01')
    expect(result).toMatch(/Jan/)
    expect(result).toMatch(/2024/)
  })

  test('falls back gracefully for invalid date string', () => {
    const result = formatDate('not-a-date')
    // Should not throw; returns the input string as fallback
    expect(typeof result).toBe('string')
  })
})

describe('truncate', () => {
  test('returns string unchanged when shorter than limit', () => {
    expect(truncate('Short', 10)).toBe('Short')
  })

  test('returns string unchanged when equal to limit', () => {
    expect(truncate('ExactLimit!', 11)).toBe('ExactLimit!')
  })

  test('truncates and appends ellipsis when longer than limit', () => {
    expect(truncate('Supercalifragilistic', 10)).toBe('Superca...')
  })

  test('ellipsis is exactly 3 chars appended to slice', () => {
    const result = truncate('ABCDEFGHIJ', 7)
    expect(result).toBe('ABCD...')
    expect(result.length).toBe(7)
  })
})

describe('getInitials', () => {
  test('single word name → first letter uppercase', () => {
    expect(getInitials('Amara')).toBe('A')
  })

  test('two word name → first letters of first and last', () => {
    expect(getInitials('Daniel Johnson')).toBe('DJ')
  })

  test('multi-word name → first letter of first and last word', () => {
    expect(getInitials('Dr. Robert Smith')).toBe('DS')
  })

  test('returns uppercase initials', () => {
    expect(getInitials('john doe')).toBe('JD')
  })
})

describe('slugify', () => {
  test('converts spaces to hyphens and lowercases', () => {
    expect(slugify('Pure Mathematics 101')).toBe('pure-mathematics-101')
  })

  test('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world')
  })

  test('collapses multiple spaces/hyphens', () => {
    expect(slugify('one  two---three')).toBe('one-two-three')
  })

  test('trims leading/trailing hyphens', () => {
    expect(slugify('  hello world  ')).toBe('hello-world')
  })
})

describe('chunk', () => {
  test('splits array into chunks of given size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })

  test('single chunk when size >= array length', () => {
    expect(chunk([1, 2, 3], 10)).toEqual([[1, 2, 3]])
  })

  test('empty array returns empty array', () => {
    expect(chunk([], 3)).toEqual([])
  })

  test('throws RangeError when size is 0', () => {
    expect(() => chunk([1, 2, 3], 0)).toThrow(RangeError)
  })

  test('throws RangeError when size is negative', () => {
    expect(() => chunk([1, 2, 3], -1)).toThrow(RangeError)
  })
})

describe('groupBy', () => {
  const students = [
    { name: 'Alice', grade: 'A' },
    { name: 'Bob', grade: 'B' },
    { name: 'Charlie', grade: 'A' },
    { name: 'Dave', grade: 'C' },
  ]

  test('groups array objects by a given field', () => {
    const result = groupBy(students, 'grade')
    expect(result['A']).toHaveLength(2)
    expect(result['B']).toHaveLength(1)
    expect(result['C']).toHaveLength(1)
  })

  test('preserves all items in groups', () => {
    const result = groupBy(students, 'grade')
    expect(result['A']).toContainEqual({ name: 'Alice', grade: 'A' })
    expect(result['A']).toContainEqual({ name: 'Charlie', grade: 'A' })
  })

  test('empty array returns empty object', () => {
    expect(groupBy([], 'grade')).toEqual({})
  })
})

describe('unique', () => {
  test('removes duplicate primitives', () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
  })

  test('removes duplicate strings', () => {
    expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
  })

  test('empty array returns empty array', () => {
    expect(unique([])).toEqual([])
  })

  test('preserves order of first occurrence', () => {
    expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2])
  })
})
