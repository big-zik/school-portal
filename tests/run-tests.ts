import {
  formatCurrency,
  getLetterGrade,
  getAttendanceColor,
  getInitials,
  slugify,
  truncate,
} from '../src/lib/utils'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from '../src/lib/validators'

console.log('🧪 Running School Portal Automated Test Suite...\n')

let passed = 0
let failed = 0

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`)
    passed++
  } else {
    console.error(`  ❌ FAIL: ${testName}`)
    failed++
  }
}

// 1. Utils Tests
assert(formatCurrency(285000).includes('285,000'), 'formatCurrency formats NGN currency properly')
assert(getLetterGrade(95) === 'A+', 'getLetterGrade(95) -> A+')
assert(getLetterGrade(85) === 'A', 'getLetterGrade(85) -> A')
assert(getLetterGrade(75) === 'B', 'getLetterGrade(75) -> B')
assert(getLetterGrade(40) === 'F', 'getLetterGrade(40) -> F')
assert(getAttendanceColor(95).includes('green'), 'getAttendanceColor(95) -> green')
assert(getInitials('Daniel Johnson') === 'DJ', 'getInitials("Daniel Johnson") -> DJ')
assert(slugify('Pure Mathematics 101') === 'pure-mathematics-101', 'slugify cleans and joins words')
assert(truncate('Supercalifragilistic', 10) === 'Superca...', 'truncate shortens text with ellipsis to maxLen')

// 2. Validator Tests
assert(
  loginSchema.safeParse({ email: 'student.daniel@school.com', password: 'Password@123' }).success,
  'loginSchema accepts valid email and password'
)
assert(
  !loginSchema.safeParse({ email: 'invalid-email', password: 'Password@123' }).success,
  'loginSchema rejects malformed email'
)
assert(
  registerSchema.safeParse({
    name: 'Daniel',
    email: 'd@school.com',
    password: 'Password@123',
    confirmPassword: 'Password@123',
  }).success,
  'registerSchema accepts valid registration'
)
assert(
  !registerSchema.safeParse({
    name: 'Daniel',
    email: 'd@school.com',
    password: 'Password@123',
    confirmPassword: 'MismatchPassword@123',
  }).success,
  'registerSchema rejects mismatched passwords'
)
assert(
  !registerSchema.safeParse({
    name: 'Daniel',
    email: 'd@school.com',
    password: 'weak',
    confirmPassword: 'weak',
  }).success,
  'registerSchema rejects weak password without capital/digit/symbol'
)
assert(
  forgotPasswordSchema.safeParse({ email: 'valid@school.com' }).success,
  'forgotPasswordSchema accepts valid email'
)
assert(
  !forgotPasswordSchema.safeParse({ email: '' }).success,
  'forgotPasswordSchema rejects empty email'
)

console.log(`\n========================================`)
console.log(`Test Results: ${passed} Passed, ${failed} Failed`)
console.log(`========================================\n`)

if (failed > 0) process.exit(1)
