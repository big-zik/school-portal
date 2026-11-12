# 🛡️ Security Design & Threat Model: School Portal

**Document ID:** DOC-SEC-001  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** Information Security & Compliance Team  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Chief Information Security Officer | Comprehensive security architecture, threat model, and RBAC matrix | Approved |

---

## 2. Authentication Flow & Session Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant Middleware as Next.js Middleware
    participant AuthAPI as NextAuth.js (/api/auth)
    participant DB as PostgreSQL DB
    
    User->>AuthAPI: POST credentials (email, password)
    AuthAPI->>DB: Query User record by email
    DB-->>AuthAPI: User record with passwordHash
    AuthAPI->>AuthAPI: bcrypt.compare(password, passwordHash)
    alt Password Invalid
        AuthAPI-->>User: 401 Unauthorized ("Invalid credentials")
    else Password Valid
        AuthAPI->>AuthAPI: Generate encrypted JWT session token
        AuthAPI-->>User: 200 OK (Set-Cookie: HttpOnly; Secure; SameSite=Lax)
    end
    
    User->>Middleware: Request protected route (e.g. /admin/payroll)
    Middleware->>Middleware: Verify JWT & extract role
    alt Role Not Permitted
        Middleware-->>User: Redirect to /unauthorized or /login
    else Role Authorized
        Middleware-->>User: Serve protected page
    end
```

---

## 3. Role-Based Access Control (RBAC) Permission Matrix

| Module / Action | Super Admin | School Admin | Bursar / Acct | Teacher | Student | Parent | Librarian |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Manage Users & System Roles** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Audit Logs** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Approve Admissions** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Take Class Attendance** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Edit CA Scores & Exam Marks** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Publish Broadsheet / Results** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Unlocked Report Card** | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Manage Fee Structures & Invoices**| ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Approve Bank Payment Receipts** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Execute Staff Payroll** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Create CBT Quizzes** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Take Live CBT Quiz** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Issue Library Book Loans** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 4. Threat Model & Countermeasures (STRIDE)

| Threat Category | Potential Attack Vector | Applied Engineering Countermeasure |
|---|---|---|
| **Spoofing** | Attacker impersonating parent or teacher | Session cookies set with `HttpOnly`, `Secure`, and `SameSite=Lax`. Passwords hashed with bcrypt ($\ge 10$ salt rounds). |
| **Tampering** | Man-in-the-middle altering grades or payment status | TLS 1.3 encryption on all connections. Paystack webhooks verified using HMAC SHA-512 signatures. |
| **Repudiation** | Staff member claiming they did not alter a student grade or approve a fake receipt | Immutable `AuditLog` table recording `userId`, `action`, `entityType`, `oldValue`, `newValue`, and timestamp. |
| **Information Disclosure**| Student accessing other students' results or confidential fee ledgers | Database queries scope access strictly by `session.user.id` or assigned class rosters. Direct object references (IDOR) prevented. |
| **Denial of Service** | Flooding CBT submission endpoint during exam | Rate limiting, connection pooling in Prisma, and efficient indexed queries. |
| **Elevation of Privilege** | Student modifying client request to access `/admin/payroll` | Next.js server-side layout and API-level role validation using `requireRole(['ADMIN', 'ACCOUNTANT'])`. |

---

## 5. Data Encryption & Storage Security
- **Data in Transit:** TLS 1.3 enforced across all HTTP traffic. Plain HTTP requests automatically redirected to HTTPS.
- **Data at Rest:** Sensitive configurations and API keys (`PAYSTACK_SECRET_KEY`, `DATABASE_URL`) stored strictly as server-side environment variables; never exposed to browser bundles.
- **File Upload Protection:** File uploads checked against allowed MIME types (`image/jpeg`, `image/png`, `application/pdf`). File size capped at 10MB. File names sanitized with cryptographic hashes to prevent path traversal attacks.
