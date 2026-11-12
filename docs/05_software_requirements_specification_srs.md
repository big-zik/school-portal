# 📑 Software Requirements Specification (SRS): School Portal

**Document ID:** DOC-SRS-001  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Standard:** IEEE 830-1998 Aligned  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Lead Systems Architect | Comprehensive formal IEEE-standard Software Requirements Specification | Approved |

---

## 2. Introduction

### 2.1 Purpose of the System
This Software Requirements Specification (SRS) establishes the complete functional and non-functional specifications for the School Portal. It provides the definitive technical baseline for software developers, testers, administrators, and educational stakeholders.

### 2.2 Intended Audience
This document is prepared for software engineers, QA specialists, devops personnel, school administrators, bursars, and external audit authorities.

### 2.3 Scope of the Portal
The School Portal is a cloud-native, responsive web application and Progressive Web App (PWA) facilitating student enrollment, admission screening, academic assessment, Continuous Assessment (CA) calculation, computer-based testing, financial fee settlement, staff payroll, sick bay clinical encounters, library management, and real-time parent engagement.

### 2.4 Definitions, Acronyms, and Abbreviations
- **CA:** Continuous Assessment (typically split into CA1: 20 marks, CA2: 20 marks, Exam: 60 marks).
- **CBT:** Computer-Based Testing.
- **RBAC:** Role-Based Access Control.
- **PWA:** Progressive Web App.
- **PAYE:** Pay As You Earn (Personal Income Tax withholding).
- **WAEC / WASSCE:** West African Examinations Council / West African Senior School Certificate Examination.
- **NECO / SSCE:** National Examinations Council / Senior School Certificate Examination.
- **BECE:** Basic Education Certificate Examination (Junior WAEC).
- **NCEE:** National Common Entrance Examination.
- **Kobo:** Lowest currency subunit in Nigeria (1 Naira = 100 Kobo).

---

## 3. Overall Description

### 3.1 Product Perspective
The School Portal operates as a centralized web platform interacting with PostgreSQL for data storage, Paystack for payment processing, and modern web browsers across desktop, tablet, and smartphone form factors.

```mermaid
graph TD
    Client[Web & PWA Client (Desktop/Mobile)] <--> AppRouter[Next.js 14 App Router (RSC & API Routes)]
    AppRouter <--> Auth[NextAuth.js v5 (RBAC Sessions)]
    AppRouter <--> Prisma[Prisma ORM Client]
    Prisma <--> DB[(PostgreSQL Database)]
    AppRouter <--> Paystack[Paystack Payment Gateway API]
    AppRouter <--> Storage[Local & S3 Compatible Document Storage]
```

### 3.2 User Classes & Characteristics
1. **Super Administrator:** Complete access to multi-tenant settings, audit logs, system-wide configuration.
2. **School Administrator:** Manages school staff, class setups, admissions, student enrollment, academic calendar, and discipline records.
3. **Bursar / Accountant:** Oversees fee categories, invoices, Paystack reconciliations, bank transfer receipts, staff payroll, and operational disbursements.
4. **Teacher:** Manages assigned classes, records daily attendance, authors assignments, grades CA score sheets, and enters terminal exam marks.
5. **Student:** Accesses learning timetables, submits homework, takes timed CBT quizzes, checks results, and enrolls in clubs.
6. **Parent / Guardian:** Views attendance records, pays school fees online, uploads bank payment receipts, checks terminal report cards, and logs support inquiries.
7. **Librarian / Storekeeper:** Issues book loans, maintains library catalog, and tracks uniform/store inventory re-order alerts.
8. **Medical Officer:** Records clinic encounters, vital signs, bed admissions, and issues parent health advisories.

---

## 4. Specific Functional Requirements

### 4.1 Authentication & Security (AUTH)
- **AUTH-01:** System shall authenticate users via email and encrypted password using bcrypt salt rounds $\ge 10$.
- **AUTH-02:** System shall enforce role-based access control protecting all `/admin/*`, `/teacher/*`, `/student/*`, `/parent/*`, and `/super-admin/*` routes.
- **AUTH-03:** System shall log every sensitive action (grade edit, admissions approval, payroll execution, receipt confirmation) to an immutable `AuditLog` table.

### 4.2 Admissions & Registry (ADM)
- **ADM-01:** Prospective students or parents shall apply online via `/admissions/apply` without requiring prior login.
- **ADM-02:** Admissions officers shall view, review, accept, or reject applications with custom review notes.
- **ADM-03:** Acceptance shall automatically generate a unique matriculation/admission number (e.g. `STU/2026/XXXX`) and provision a student account.

### 4.3 Academic Operations & Grading (ACAD)
- **ACAD-01:** Teachers shall record Continuous Assessment marks: CA 1 ($\le 20$), CA 2 ($\le 20$), and Examination ($\le 60$) totaling 100 marks per student subject.
- **ACAD-02:** System shall compute percentage totals and assign official letter grades and grade points (A1: 75-100, B2: 70-74, B3: 65-69, C4: 60-64, C5: 55-59, C6: 50-54, D7: 45-49, E8: 40-44, F9: 0-39).
- **ACAD-03:** System shall compile terminal broadsheets ranking students by cumulative average score with class position calculation.
- **ACAD-04:** System shall support end-of-year promotion engine promoting qualified students to the next class tier or flagging repeaters.
- **ACAD-05:** Senior Secondary students (SS 1–3) shall be assigned to specialized academic streams (Science, Arts, Commercial).

### 4.4 Fees & Financial Clearance (FIN)
- **FIN-01:** System shall generate termly invoices with itemized charges in integer Kobo.
- **FIN-02:** Parents shall pay online using Paystack (debit card, bank transfer, USSD).
- **FIN-03:** Parents shall upload bank deposit/transfer payment receipts with teller/reference numbers.
- **FIN-04:** Bursars shall review pending bank receipts and approve or reject them with feedback notes.
- **FIN-05 (Fee-Based Result Lock):** System shall block access to examination results and printable report cards for students with outstanding balances unless cleared by bursar waiver.

### 4.5 Computer-Based Testing (CBT)
- **CBT-01:** Teachers shall create CBT quizzes with multiple-choice questions, answer keys, duration timers, and passing scores.
- **CBT-02:** Student testing room shall display an active countdown timer with auto-submit upon timer expiration.
- **CBT-03:** System shall automatically evaluate student answers upon submission and deliver instant score breakdowns.

### 4.6 Payroll & Operating Expenses (HR & EXP)
- **PAY-01:** Bursars shall execute monthly payroll calculating Basic Pay, Allowances (Housing, Transport), statutory Pension (8%), and PAYE tax.
- **EXP-01:** Bursars shall record operational disbursements with payment voucher numbers, expense categories, and payee details.

### 4.7 Health, Inventory & Clubs (OPS)
- **HLT-01:** Sick bay nurse shall log student clinic encounters, vitals (temperature, blood pressure), symptoms, and treatment.
- **INV-01:** Storekeeper shall catalog school supplies and flag low-stock warnings when inventory drops below re-order thresholds.
- **CLB-01:** Students shall browse chartered extracurricular societies and enroll with single-click membership.
- **EXT-01:** Registry shall record candidate registrations for WAEC, NECO, BECE, and Common Entrance with biometric photocard verification.

---

## 5. Non-Functional Requirements (NFR)

1. **Performance:** Sub-second database query execution via indexed foreign keys; API payload sizes under 500KB.
2. **Security:** HTTPS/TLS 1.3 enforcement, parameterized SQL queries via Prisma, sanitization against XSS.
3. **Usability & Responsiveness:** Fully functional on viewport widths from 360px (mobile) to 2560px (ultra-wide 4K).
4. **Maintainability:** Modular Next.js 14 App Router layout structure with strict TypeScript definitions and Jest unit test coverage.
5. **Accessibility:** WCAG 2.1 Level AA color contrast ratios and keyboard navigation support.
