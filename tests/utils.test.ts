import {
  formatCurrency,
  getLetterGrade,
  getAttendanceColor,
  getInitials,
  slugify,
  truncate,
} from '../src/lib/utils'

describe('Utility Functions', () => {
  test('formatCurrency formats values correctly in NGN', () => {
    const formatted = formatCurrency(285000)
    expect(formatted).toContain('285,000')
  })

  test('getLetterGrade returns correct grades according to scale', () => {
    expect(getLetterGrade(95)).toBe('A+')
    expect(getLetterGrade(85)).toBe('A')
    expect(getLetterGrade(75)).toBe('B')
    expect(getLetterGrade(65)).toBe('C')
    expect(getLetterGrade(55)).toBe('D')
    expect(getLetterGrade(40)).toBe('F')
  })

  test('getAttendanceColor returns appropriate color variants', () => {
    expect(getAttendanceColor(95)).toContain('emerald')
    expect(getAttendanceColor(80)).toContain('amber')
    expect(getAttendanceColor(60)).toContain('red')
  })

  test('getInitials extracts user initials properly', () => {
    expect(getInitials('Daniel Johnson')).toBe('DJ')
    expect(getInitials('Dr. Robert Smith')).toBe('DR')
    expect(getInitials('Amara')).toBe('A')
  })

  test('slugify cleans and slugifies strings', () => {
    expect(slugify('Pure Mathematics 101')).toBe('pure-mathematics-101')
  })

  test('truncate limits string length with ellipsis', () => {
    expect(truncate('Supercalifragilistic', 10)).toBe('Supercalif...')
    expect(truncate('Short', 10)).toBe('Short')
  })
})
