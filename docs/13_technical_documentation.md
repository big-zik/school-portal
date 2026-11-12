# 💻 Technical & Engineering Guidelines: School Portal

**Document ID:** DOC-DEV-001  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** Software Engineering Quality & Standards Team  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Principal Engineer | Core coding standards, git branching, and engineering practices | Approved |

---

## 2. Technology Stack Overview

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime Environment** | Node.js | v20 LTS | High-performance asynchronous JavaScript runtime |
| **Framework** | Next.js (App Router) | 14.2+ | React server components, routing, and API route handlers |
| **Language** | TypeScript | 5.3+ | Strict static type safety (`strict: true`) |
| **Database ORM** | Prisma | 5.12+ | Type-safe query building and database migration management |
| **Database Engine** | PostgreSQL | 15+ | Enterprise relational ACID data store |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first responsive CSS styling |
| **Icons** | Lucide React | Latest | Consistent SVG vector iconography |
| **Testing** | Jest & ts-jest | 29+ | Unit testing and API assertion framework |
| **Authentication** | NextAuth.js | v5 Beta | Role-based session and token management |

---

## 3. Directory & Folder Structure

```
school-portal/
├── docs/                       # Formal software engineering documentation
├── prisma/
│   ├── schema.prisma           # 61+ entity data models and relationships
│   └── seed.ts                 # Database seed script for development & testing
├── public/
│   ├── manifest.json           # Progressive Web App (PWA) manifest
│   └── uploads/                # Local uploaded documents & receipts
├── src/
│   ├── app/                    # Next.js 14 App Router routes & layouts
│   │   ├── (auth)/             # Login, register, forgot-password pages
│   │   ├── (dashboard)/        # Role-based dashboard interfaces
│   │   │   ├── admin/          # Administrator & Principal console
│   │   │   ├── teacher/        # Teacher grades, attendance & timetable
│   │   │   ├── student/        # Student homework, CBT & report cards
│   │   │   ├── parent/         # Parent fee payments, children, circulars
│   │   │   └── super-admin/    # Multi-tenant & audit log management
│   │   ├── (public)/           # Public landing site & admissions application
│   │   └── api/                # REST API route handlers
│   ├── components/             # Reusable UI components & layouts
│   ├── lib/                    # Shared utilities, auth helpers & DB clients
│   └── types/                  # Global TypeScript type definitions
└── tests/                      # Jest test suites (Phase 1-4 validation)
```

---

## 4. Git Branching Strategy & Commit Standards

### 4.1 Branching Strategy (Git Flow Lite)
- `main`: Production-ready, verified code. Protected branch.
- `develop`: Integration branch for active sprint features.
- `feature/<ticket-id>-<description>`: Dedicated feature development branches.
- `hotfix/<ticket-id>`: Emergency production bugfixes.

### 4.2 Conventional Commit Format
All commits must follow the standard conventional commit format:
```
<type>(<scope>): <short description in present tense>

[optional body describing the motivation or changes]
```
- **Allowed Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
- **Examples:**
  - `feat(phase1): add bank receipt upload and bursar approval queue`
  - `fix(auth): prevent horizontal role escalation on parent results query`
  - `docs(srs): add formal software requirements specification`

---

## 5. Coding Standards & Error Handling

### 5.1 Currency Handling
- **Rule:** Never store or calculate monetary amounts as floating-point decimals.
- **Implementation:** Always store currency values as integer **Kobo** in database columns (`amountKobo`). Convert to Naira (`amountKobo / 100`) strictly at presentation layers.

### 5.2 API Error Handling Standard
All API route handlers must wrap execution in `try-catch` blocks returning structured JSON responses:
```typescript
try {
  // Business logic
  return NextResponse.json<ApiResponse>({ success: true, data: result })
} catch (error: any) {
  console.error('[API_ERROR] Module:', error)
  return NextResponse.json<ApiResponse>(
    { success: false, error: error.message || 'Internal server error' },
    { status: error.status || 500 }
  )
}
```

### 5.3 Audit Logging Rule
Any operation that alters financial records, academic marks, user credentials, or admission status **must** invoke `logAudit()`:
```typescript
await logAudit({
  userId: session.user.id,
  action: 'UPDATE_GRADE',
  module: 'ACADEMIC_RESULTS',
  entityType: 'Result',
  entityId: result.id,
  oldValue: previousScores,
  newValue: updatedScores,
})
```
