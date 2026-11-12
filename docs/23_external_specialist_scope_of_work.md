# 🤝 External Specialist Scope of Work (SOW) & Technical Task Brief: School Portal

**Document ID:** DOC-SOW-001  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** Software Engineering Leadership  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Principal Architect | Scope of work, deliverables, and requirements for external technical specialists | Approved |

---

## 2. Overview & Purpose
This document provides a formal, ready-to-issue **Scope of Work (SOW)** and task brief for onboarding external specialists, freelancers, or consulting agencies to polish and audit the School Portal. 

It details the exact responsibilities, deliverables, preconditions, and acceptance criteria across five specialized domains:
1. **UI/UX Design**
2. **Frontend Polishing**
3. **Backend & API Polishing**
4. **Database & Authentication**
5. **Testing & Security Verification**

---

## 3. Workstream Breakdown & Task Specifications

---

### Workstream 1: UI/UX Design

#### 1.1 Objective
Elevate the visual aesthetic, accessibility, usability, and design system cohesion across all 8 user roles (Super Admin, Admin, Teacher, Student, Parent, Accountant, Librarian, Medical Officer).

#### 1.2 What the External Designer Needs to Do
1. **Design System & Component Library (Figma):**
   - Create a centralized Figma UI kit containing typography scales, color tokens (Primary Navy, Emerald, Amber, Rose, Slate), input fields, modal dialogs, data tables, and badges.
   - Establish WCAG 2.1 Level AA compliant color contrast ratios for light and dark modes.
2. **Key Dashboard & Wireframe Refinements:**
   - Redesign complex workflows into intuitive user experiences:
     - **Parent Portal:** Multi-child tab switcher, itemized fee invoices, and mobile receipt upload dialog.
     - **Teacher Continuous Assessment Desk:** Desktop spreadsheet-style grade matrix with sticky student name columns and instant totals.
     - **Student CBT Test Room:** Focused, distraction-free test interface with persistent countdown timer, question palette, and instant score celebration modal.
     - **Bursar Financial Cockpit:** Visual collections summary, overdue debtor tables, and side-by-side receipt audit comparison viewer.
3. **Printable Document Templates:**
   - High-fidelity visual layouts for the official **Terminal Report Card**, **Student ID Card**, **Fee Receipt Voucher**, and **Staff Payslip** (optimized for A4 print and PDF export).
4. **Mobile & PWA Layout Specs:**
   - Mobile-first layouts (360px – 430px) for phone screens, bottom navigation bars, and touch-friendly controls (minimum 44x44px touch targets).

#### 1.3 Expected Deliverables
- [ ] Complete Figma design file with design tokens, components, and auto-layout frames.
- [ ] Interactive desktop and mobile prototype links.
- [ ] Exported SVG/PNG icon assets and printable A4 report card templates.
- [ ] UI style guide document specifying font families, spacing units, and micro-interactions.

#### 1.4 Acceptance Criteria
- Designs cover all responsive breakpoints (360px, 768px, 1024px, 1440px).
- Zero contrast accessibility failures under WCAG 2.1 AA.
- Form inputs include defined default, hover, focus, error, and disabled states.

---

### Workstream 2: Frontend Polishing

#### 2.1 Objective
Translate Figma designs into pixel-perfect, performant, and accessible React/Next.js components, ensuring fluid animations, responsive layouts, and zero client-side warnings.

#### 2.2 What the External Frontend Engineer Needs to Do
1. **UI Kit Implementation & Styling Harmonization:**
   - Align existing Tailwind CSS classes with the Figma design system tokens.
   - Standardize table components with sticky headers, striped rows, and responsive horizontal scroll indicators.
   - Implement consistent state feedback banners (Empty, Loading Skeleton, Error, Success).
2. **Interactive Component Optimization:**
   - **CBT Interface:** Smooth question transitions, warning banners when timer enters the final 60 seconds, and offline state detection.
   - **Receipt Viewer Modal:** Interactive image zoom and PDF previewer for bursar audit verifications.
   - **Continuous Assessment Sheet:** Keyboard navigation (Arrow keys, Tab, Enter) for rapid mark entry by teachers.
3. **Client-Side Form Validation & Toast Notifications:**
   - Implement real-time client-side input validation (Zod + React Hook Form) to prevent invalid submissions before API requests.
   - Standardize toast notification alerts (e.g. Sonner or React Hot Toast) for all async actions.
4. **Mobile Responsiveness & PWA Enhancements:**
   - Audit and refine all screens on real mobile devices (iOS Safari, Android Chrome).
   - Ensure bottom navigation and collapsible sidebars do not block viewport controls.

#### 2.3 Expected Deliverables
- [ ] Pull requests on GitHub with clean, modular TypeScript/React code.
- [ ] Reusable UI components stored in `src/components/ui/` with zero TypeScript errors (`tsc --noEmit`).
- [ ] Lighthouse Performance & Accessibility score $\ge 90$ on mobile and desktop.

#### 2.4 Acceptance Criteria
- All responsive pages render correctly across Chrome, Safari, Firefox, and Edge.
- Zero console errors or unhandled hydration warnings.
- Layout shifts (CLS) $\le 0.1$.

---

### Workstream 3: Backend and API Polishing

#### 2.1 Objective
Refine API endpoints for resilience, caching, rate limiting, error standardization, and high-concurrency throughput during peak admission and examination periods.

#### 2.2 What the External Backend Engineer Needs to Do
1. **API Standardization & Validation:**
   - Enforce Zod schema validation on all incoming request bodies (`req.json()`) across all `/api/*` routes.
   - Ensure every API route returns the uniform `ApiResponse<T>` envelope with appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 429, 500).
2. **Rate Limiting & Abuse Prevention:**
   - Implement in-memory or Redis-backed rate limiting on sensitive endpoints:
     - Authentication login: max 5 failed attempts per IP per 15 minutes.
     - CBT quiz submission: max 1 submission per test attempt token.
     - Public admissions application: max 10 requests per IP per hour.
3. **Paystack Gateway Webhook Hardening:**
   - Verify HMAC SHA-512 webhook signature verification.
   - Implement idempotent transaction processing (guarantee duplicate webhook payloads do not credit payments twice).
4. **Export Engines & Async Processing:**
   - Build server-side PDF generator endpoints for official terminal report cards and bursar receipts (e.g. using `@react-pdf/renderer` or Puppeteer).
   - Build CSV/Excel export endpoints for broadsheet rankings and debtors registers.

#### 2.3 Expected Deliverables
- [ ] Pull requests with hardened API routes and Zod validation schemas.
- [ ] OpenAPI 3.0 / Swagger JSON specification file documenting all endpoints.
- [ ] Unit and integration tests for all newly hardened route handlers.

#### 2.4 Acceptance Criteria
- 100% of mutating routes validate inputs with Zod schemas.
- Paystack webhook passes replay attack and duplicate event tests.
- All endpoints respond in $< 200\text{ms}$ under typical query loads.

---

### Workstream 4: Database and Authentication

#### 4.1 Objective
Audit and optimize the PostgreSQL relational database schema, database indexes, connection pooling, and multi-factor authentication (MFA) mechanisms.

#### 4.2 What the External Database & Auth Engineer Needs to Do
1. **Schema Review & Index Optimization:**
   - Audit all 61 Prisma models in `prisma/schema.prisma` for missing compound indexes on high-frequency query paths (e.g. `[studentId, termId]`, `[classId, academicYearId]`).
   - Configure Prisma connection pooling and optimize raw SQL broadsheet ranking queries for large student cohorts.
2. **Graduate Phase 4 Modules to First-Class Models:**
   - Migrate Phase 4 modules (CBT exams, staff payroll, clinic visits, store inventory, clubs, external exams) from audit log storage to dedicated relational Prisma tables with migration scripts.
3. **Session & Authentication Hardening:**
   - Implement Multi-Factor Authentication (TOTP / Google Authenticator) for administrative and bursary accounts (`MfaConfig` model).
   - Implement automated session revocation upon password reset or role modification.
4. **Data Privacy & Backup Automation:**
   - Configure automated daily PostgreSQL logical dumps (`pg_dump`) with AES-256 encryption sent to remote cloud storage.
   - Implement soft-delete filters (`isDeleted: false`) on critical academic and student entities.

#### 4.3 Expected Deliverables
- [ ] Clean Prisma migration files (`prisma/migrations/`) with zero data loss.
- [ ] Documented indexing strategy and query execution plans (`EXPLAIN ANALYZE`).
- [ ] Functional TOTP MFA implementation for Super Admin and Bursar roles.
- [ ] Automated backup and restoration shell scripts with verification runbooks.

#### 4.4 Acceptance Criteria
- Database migrations execute cleanly without breaking existing seed data.
- Foreign key constraints prevent orphaned records across student enrollments and fee payments.
- Password hashes verified with bcrypt $\ge 12$ salt rounds or Argon2id.

---

### Workstream 5: Testing and Security Verification

#### 5.1 Objective
Conduct end-to-end quality assurance, automated test suite expansion, security penetration testing, and compliance verification.

#### 5.2 What the External QA & Security Auditor Needs to Do
1. **End-to-End (E2E) Test Suite Development:**
   - Author automated browser-based E2E tests using **Playwright** or **Cypress** covering:
     - Prospective student online admission $\rightarrow$ Admin acceptance $\rightarrow$ Student account activation.
     - Teacher CA 1 + CA 2 + Exam score input $\rightarrow$ Broadsheet compilation $\rightarrow$ Report card lock/unlock.
     - Parent Paystack fee payment $\rightarrow$ Webhook confirmation $\rightarrow$ Result clearance.
     - Timed CBT exam run $\rightarrow$ Auto-submit upon countdown timer expiry.
2. **Penetration Testing & Vulnerability Assessment:**
   - Test for **OWASP Top 10** vulnerabilities:
     - Insecure Direct Object References (IDOR): ensure Parent A cannot view Student B's grades or fees by altering URL IDs.
     - Horizontal Role Escalation: ensure Student/Teacher cannot access `/admin/*` or `/api/payroll`.
     - Injection attacks: test for SQL injection, XSS, and command injection across all input forms.
     - CSRF and session fixation attacks.
3. **Load & Stress Testing:**
   - Execute load testing using **k6** or **Locust** simulating 500 concurrent students taking CBT exams simultaneously and 200 parents querying report cards.
4. **Formal Audit Report:**
   - Compile a comprehensive Vulnerability Assessment and Penetration Testing (VAPT) report detailing findings, severity ratings, reproduction steps, and remediation patches.

#### 5.3 Expected Deliverables
- [ ] Comprehensive Playwright/Cypress E2E test suite in the repository.
- [ ] Formal Penetration Testing & Security Audit Report (PDF).
- [ ] Load testing performance metrics report with bottleneck analysis.
- [ ] Remediation pull request addressing all identified critical and high vulnerabilities.

#### 5.4 Acceptance Criteria
- Zero Critical (S1) or High (S2) vulnerabilities remaining.
- E2E test suite executes with 100% pass rate in CI/CD pipeline.
- Portal sustains 500 concurrent active users with $< 1\%$ error rate and $< 1.5\text{s}$ response time.

---

## 4. External Contractor Onboarding & Access Package

To enable external specialists to start immediately, provide them with this technical onboarding kit:

```
=============================================================================
EXTERNAL SPECIALIST ACCESS CHECKLIST
=============================================================================
1. Code Repository:
   - Git Remote: https://github.com/big-zik/school-portal.git
   - Access: Grant Collaborator / Read-Write access on a dedicated feature branch.
   - Branching Convention: feature/<specialist-name>-<module-name>

2. Technical Documentation Package:
   - Project Charter & SRS: /docs/01_project_charter.md, /docs/05_software_requirements_specification_srs.md
   - Software Design (SDD) & ERD: /docs/08_software_design_document_sdd.md, /docs/09_database_design_and_erd.md
   - REST API Reference: /docs/10_api_design.md
   - Local Setup Guide: /docs/15_source_code_documentation.md

3. Local Environment Quickstart:
   - Clone repo -> npm install -> configure .env -> npm run seed -> npm test
   - Pre-populated test accounts:
     * Super Admin: superadmin@school.com (Password123!)
     * Teacher: teacher.adeyemi@school.com (Password123!)
     * Student: student.chidiebere@school.com (Password123!)
     * Parent: parent.johnson@school.com (Password123!)
     * Accountant: accountant@school.com (Password123!)

4. Communication & Review Protocol:
   - Submissions via GitHub Pull Requests against 'main' branch.
   - Every PR must pass 'npx tsc --noEmit' and 'npm test' in CI before merge.
=============================================================================
```

---

## 5. Summary Matrix & Estimated Effort

| Role / Specialism | Key Deliverables | Estimated Effort |
|---|---|:---:|
| **UI/UX Designer** | Figma design system, desktop/mobile frames, report card/receipt print templates | 2 – 3 Weeks |
| **Frontend Engineer** | Component styling harmonization, keyboard nav, real-time Zod validation, responsive polish | 2 – 3 Weeks |
| **Backend & API Engineer** | Zod input guards, rate limiting, PDF export engine, idempotent webhook processor | 2 Weeks |
| **Database & Auth Specialist** | Compound indexing, Phase 4 table graduation, TOTP MFA, automated backup runbooks | 1 – 2 Weeks |
| **QA & Security Auditor** | Playwright E2E suites, OWASP Top 10 pentest, k6 load testing, formal VAPT report | 2 Weeks |
