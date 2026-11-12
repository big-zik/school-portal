# 📋 Project Charter: School Portal

**Document ID:** DOC-PROJ-001  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** Lead Software Engineering Architect  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Principal Engineer | Initial baseline formal project charter | Approved |

---

## 2. Project Name & Description
- **Project Name:** School Portal Enterprise School Management System (SMS)
- **Codebase Repository:** `https://github.com/big-zik/school-portal.git`
- **Application Classification:** Full-Stack Cloud-Native Multi-Tenant Educational Portal & PWA

---

## 3. Project Purpose and Objectives
The School Portal is built to modernize and unify educational administration, student continuous assessment, parent engagement, payment settlement, and institutional record-keeping across primary and secondary school tiers (Nursery, Primary, JSS, SSS).

### Core Objectives:
1. **Zero-Paper Assessment & Result Compilation:** Automate Continuous Assessment (CA) computation, terminal examination scoring, broadsheet ranking, and tamper-proof PDF report-card generation with digital verification QR codes.
2. **Transparent Financial Management:** Real-time school fee invoicing, payment gateway reconciliation (Paystack), offline bank receipt approval workflow, and bad-debt monitoring.
3. **Parent Transparency & Community Engagement:** Eliminate parent disconnect by delivering real-time student attendance alerts, published timetables, homework trackers, and academic progress circulars.
4. **Holistic School Operations:** Provide end-to-end management for Computer-Based Testing (CBT), sick bay health encounters, staff payroll & PAYE tax, school store inventory, student clubs, and WAEC/NECO external examinations.

---

## 4. Problem Statement
Educational institutions in Nigeria and Sub-Saharan Africa face significant administrative inefficiencies:
- **Disjointed Record Systems:** Student enrollment, grading, and tuition accounting exist across disparate spreadsheets and paper ledger files.
- **Result Forgery & Delayed Publication:** Terminal report card compilation takes 3–5 weeks after exams, with manual arithmetic error rates exceeding 14%.
- **Revenue Leakage:** Fee collection tracking via unverified physical teller receipts leads to reconciliation discrepancies and delayed supplier settlements.
- **Opaque Communication:** Parents often remain unaware of unauthorized student absenteeism, failing grades, or critical administrative circulars until term completion.

---

## 5. Proposed Solution
A modern, modular, web-based and mobile-first Progressive Web Application (PWA) built with:
- **Next.js 14+ (App Router)** & **React Server Components** for performance and SEO.
- **PostgreSQL & Prisma ORM** with strong relational integrity (61+ data models).
- **NextAuth.js v5** with Role-Based Access Control (RBAC) across 8 distinct roles: Super Admin, Admin/Principal, Teacher, Student, Parent, Accountant/Bursar, Librarian, and Support Staff.
- **Paystack Webhook Engine & Bank Receipt Queue** for real-time tuition settlement and bursar audit approvals.
- **Automated Broadsheet & Timetable Scheduling Algorithms** with automatic term rollover and promotion pipelines.

---

## 6. Target Users & Stakeholders

| Stakeholder Role | Primary Functions / Touchpoints |
|---|---|
| **Super Administrator / Proprietor** | Multi-tenant governance, audit trail inspection, system-wide financial analytics, RBAC permissions. |
| **School Administrator / Principal** | Admissions approval, academic calendar, student promotions, teacher allocations, official circulars. |
| **Accountant / Bursar** | Fee structures, invoice generation, bank receipt verification, staff payroll runs, operating expense vouchers. |
| **Teacher / Form Master** | Daily attendance roll-call, CA score sheets, assignment grading, terminal report card remarks. |
| **Student** | Timetable viewing, homework submission, live CBT examinations, result access, club membership. |
| **Parent / Guardian** | Child progress tracking, real-time attendance alerts, online fee payments, helpdesk support inquiries. |
| **Librarian / Storekeeper** | Book cataloging, circulation loans, uniform/textbook inventory and re-order thresholds. |
| **School Medical Officer** | Sick bay clinical encounters, vital signs logging, parent health advisories. |

---

## 7. Project Scope

### In-Scope:
- Multi-role secure authentication with session encryption and password hashing (bcrypt).
- Student enrollment, admissions screening workflow, and automated student ID generation.
- Class arms and subject syllabus allocations with Senior Secondary stream classification (Science, Arts, Commercial).
- Timetable generation for weekly classroom periods and examination sittings.
- Continuous assessment scoring (1st CA, 2nd CA, Exam), grading scales (WAEC standard A1-F9), and broadsheets.
- Financial invoicing, Paystack card/USSD payments, bank transfer receipt upload, and bursar ledger validation.
- Fee-based result lock enforcing tuition clearance before report card generation.
- Interactive Computer-Based Testing (CBT) engine with auto-submit countdown timer and instant scoring.
- Comprehensive HR payroll run with statutory deductions (8% Pension, PAYE) and operating expense logging.
- Offline-ready mobile Progressive Web App (PWA) manifest.

### Out-of-Scope (Future Iterations):
- Native Android/iOS binaries in app stores (delivered as PWA in Phase 1-4).
- Biometric hardware fingerprint clock-in devices (software biometric logging supported).
- Multi-currency international tuition payments (cleared in Nigerian Naira - NGN).

---

## 8. Success Criteria
1. **System Performance:** 95% of dashboard pages render in `< 1.2 seconds` under standard 3G/4G network conditions.
2. **Data Accuracy:** 100% calculation accuracy on continuous assessment totals, cumulative GPAs, and payroll tax deductions.
3. **Security Compliance:** 0 high/critical vulnerabilities on authentication bypass, SQL injection, or unauthorized horizontal role escalation.
4. **Adoption & Usability:** System usability scale (SUS) score `> 85` across student, parent, and teacher user groups.

---

## 9. High-Level Project Risks & Mitigations

| Risk Description | Severity | Likelihood | Mitigation Strategy |
|---|---|---|---|
| Intermittent network connectivity in school environments | High | High | Service worker caching, lightweight payload delivery, and PWA manifest. |
| Delays in school fee reconciliation due to counterfeit bank tellers | High | Medium | Dual-layer bursar verification workflow with mandatory proof attachment and transaction audit logging. |
| Concurrent load spikes during terminal result releases | Medium | Medium | Server-side rendering (SSR), database indexing on enrollment/result lookups, and static assets CDN. |

---

## 10. Approval & Sign-Off

| Role | Name | Signature | Date |
|---|---|---|---|
| Project Sponsor / School Board Chair | Dr. A. Balogun | *Signed* | 2026-11-12 |
| Lead Technical Architect | Engr. Zik O. | *Signed* | 2026-11-12 |
| Quality Assurance Lead | C. Nwosu | *Signed* | 2026-11-12 |
| Bursar / Finance Representative | F. Adeyemi | *Signed* | 2026-11-12 |
