# 🛡️ School Portal Security & Compliance Checklist

This checklist documents the security controls and hardening measures implemented across the School Portal web application.

---

## 1. Authentication & Session Security

- [x] **Password Hashing:** Passwords hashed using bcrypt (12 salt rounds) via `bcryptjs`.
- [x] **Brute-Force & Lockout Protection:** 5 consecutive failed login attempts trigger an automatic 15-minute account lockout (`lockedUntil`).
- [x] **Uniform Error Messaging:** Login failure responses give uniform messages to prevent user enumeration attacks.
- [x] **Session Security:** Token-based authentication using cryptographically signed NextAuth v5 JSON Web Tokens (JWT) stored in HTTP-only, secure, `SameSite=Lax` cookies.
- [x] **MFA / TOTP:** Model & infrastructure ready for TOTP multi-factor authentication for privileged administrative users.
- [x] **Role-Based Access Control (RBAC):** Middleware route protection enforces least-privilege access for `STUDENT`, `PARENT`, `TEACHER`, `ADMIN`, and `SUPER_ADMIN`. Direct URL manipulation is caught at edge and redirected to authorized dashboards.

---

## 2. Data Protection & Input Sanitization

- [x] **SQL Injection Defense:** All database queries utilize Prisma ORM with parameterized queries. Raw unescaped SQL is completely avoided.
- [x] **Cross-Site Scripting (XSS):** React automatic string escaping prevents HTML injection.
- [x] **Input Validation:** Comprehensive Zod schemas validate data types, string lengths, regex patterns, and cross-field constraints on both client and server before processing.
- [x] **File Upload Security:**
  - File extension and MIME type cross-validation against a strict allowlist.
  - File size capped at 50MB (`MAX_FILE_SIZE_MB`).
  - Safe sanitized filenames generated using timestamps and UUID prefixes to prevent directory traversal or file overwrites.
- [x] **Cross-Site Request Forgery (CSRF):** Built-in NextAuth CSRF protection tokens verified on all mutating HTTP POST/PUT/DELETE requests.

---

## 3. Audit Logging & Non-Repudiation

- [x] **Forensic Audit Log:** Every critical write operation (logins, logouts, grade changes, admissions, fee settlements, and settings modifications) is recorded in the `AuditLog` table with:
  - Timestamp
  - Actor ID & User Name
  - Module & Action Type
  - IP Address & User Agent
  - Old Value & New Value (JSON state snapshot)
- [x] **Graceful Error Handling:** Audit failures log to secure stderr without breaking core business processes.

---

## 4. Privacy & Data Isolation

- [x] **Parent Data Isolation:** Parents can strictly view only their linked children’s academic records, invoices, and attendance logs.
- [x] **Teacher Least Privilege:** Teachers only access gradebooks and attendance rosters for their explicitly assigned subjects and cohorts.
- [x] **Soft Deletion:** Sensitive models (Users, Students, Teachers, Announcements) implement `deletedAt` timestamps for compliance, record retention, and accidental loss prevention.

---

## 5. Accessibility (WCAG 2.2 Compliance)

- [x] Semantic HTML5 layout tags (`<header>`, `<main>`, `<aside>`, `<footer>`, `<nav>`).
- [x] High-contrast text ratios for light and dark modes.
- [x] Keyboard focus indicators (`focus-visible:ring-2`) on all interactive buttons and inputs.
- [x] Screen-reader accessible SVG icons with `aria-label` and `title` attributes.
