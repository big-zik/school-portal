# 🏫 School Portal: Strategic Aim & Complete Functional Catalog

**Document ID:** DOC-CAT-001  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** Software Engineering & Product Management  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Principal Architect | Comprehensive institutional aim, strategic pillars, and 71-function catalog | Approved |

---

## 2. Executive Summary & Strategic Aim

The overarching aim of the **School Portal** is to provide an **all-in-one, paperless, cloud-native School Operating System (SMS)** that unifies **academic grading, financial billing, parent communication, and daily school operations** into a single tamper-proof, real-time platform.

It is specifically engineered to eliminate the manual paper bottlenecks, arithmetic errors, and financial reconciliation delays common in modern primary and secondary educational institutions.

### The 4 Strategic Pillars:
1. **Zero-Paper Academic Excellence:** Automated Continuous Assessment (CA 20+20+60) computation, WAEC/NECO standard grade letters (A1–F9), cumulative GPA calculation, class broadsheets with position rankings, and tamper-proof PDF report cards featuring cryptographic QR verification.
2. **Zero Revenue Leakage:** Seamless tuition settlement through Paystack (Debit Card, Bank Transfer, USSD), an offline bank receipt verification queue for bursar auditing, and an automated Fee-Based Result Lock protecting against unpaid student debt.
3. **Total Parental Transparency:** Real-time absenteeism SMS/portal alerts, published daily and examination timetables, direct parent-to-teacher messaging, and complete visibility into child academic performance.
4. **Holistic Campus Operations:** Computer-Based Testing (CBT) with countdown timers and instant grading, monthly staff payroll with statutory deductions (8% Pension and PAYE tax), sick bay clinic records, stores inventory re-order alerts, and national examination registry.

---

## 3. Complete Functional Catalog by Operational Domain

---

### Module 1: Authentication, Security & Multi-Role Governance
1. **Multi-Role Authentication:** Secure login using email or student matriculation number with encrypted sessions (NextAuth.js v5) and bcrypt password hashing.
2. **Role-Based Access Control (RBAC):** Strict horizontal and vertical permission enforcement across 8 distinct user roles (`Super Admin`, `Admin`, `Teacher`, `Student`, `Parent`, `Accountant/Bursar`, `Librarian`, `Medical Officer`).
3. **Immutable Audit Trail:** Automatic recording of all sensitive operations (grade updates, admission acceptances, payroll runs, receipt approvals) logging `userId`, `action`, `oldValue`, `newValue`, and timestamp.
4. **Self-Service Password Reset:** Password reset links with secure, expiring cryptographic tokens.
5. **Session Management:** Secure HTTP-only cookies preventing session hijacking and Cross-Site Scripting (XSS).

---

### Module 2: Admissions & Student Registry
6. **Public Online Application:** Prospective students/parents apply online via `/admissions/apply` without requiring prior login.
7. **Document Verification:** Upload of birth certificates, previous academic transcripts, and immunization cards.
8. **Application Status Tracking:** Real-time applicant status tracker (`SUBMITTED`, `UNDER_REVIEW`, `INTERVIEW_SCHEDULED`, `OFFERED`, `ACCEPTED`, `REJECTED`).
9. **Automated Matriculation ID Generation:** Automatic student ID provisioning (e.g. `STU/2026/XXXX`) upon acceptance.
10. **Class Tier & Arm Enrollment:** Enrollment of students into academic classes (JSS 1 through SS 3) and specific arms (A, B, C, Gold, Diamond).
11. **Senior Secondary Academic Streaming:** Segregation of SS students into specialized academic streams (**Science**, **Arts**, **Commercial**).
12. **Student Discipline Registry:** Logging disciplinary encounters, infractions, suspension status, and parent notices.

---

### Module 3: Academics, Timetables & Daily Attendance
13. **Weekly Period Scheduling:** Timetable generator allocating subjects, time slots, classrooms, and teachers across Monday to Friday.
14. **Examination Timetable Publication:** Specific scheduling of mid-term and terminal examination halls, dates, and supervisors.
15. **1-Click Morning Roll-Call:** Class attendance desk defaulting all enrolled students to `PRESENT` so roll-call takes under 60 seconds.
16. **Tardiness & Absence Flagging:** Marking individual students as `ABSENT`, `LATE`, or `EXCUSED`.
17. **Automated Absenteeism Alerts:** Immediate dispatch of notifications to parents when a child is marked absent.
18. **Attendance Analytics:** Termly calculation of total school days, percentage attendance, and chronic absenteeism warnings.

---

### Module 4: Continuous Assessment (CA) & Homework
19. **Standard CA Score Entry Grid:** Form teachers and subject teachers record:
    - **CA 1** (Maximum 20 marks)
    - **CA 2** (Maximum 20 marks)
    - **Terminal Exam** (Maximum 60 marks)
20. **Instant Real-Time Calculations:** Auto-computation of Total Score (0–100) with input validation preventing negative numbers or scores over limits.
21. **Official WAEC/NECO Grade Assignment:** Automatic mapping to standardized Nigerian secondary grades:
    - **A1** (75–100% | Excellent)
    - **B2** (70–74% | Very Good)
    - **B3** (65–69% | Good)
    - **C4** (60–64% | Credit)
    - **C5** (55–59% | Credit)
    - **C6** (50–54% | Credit)
    - **D7** (45–49% | Pass)
    - **E8** (40–44% | Pass)
    - **F9** (0–39% | Fail)
22. **Homework Assignment Publishing:** Teachers create assignments with titles, instructions, reference attachments, and submission deadlines.
23. **Online Homework Submission:** Students type responses or upload homework PDF/image attachments directly.
24. **Late Submission Flagging:** Automatic detection and tagging of homework submitted after deadlines.
25. **Assignment Feedback & Marks:** Teachers review submissions, input marks, and qualitative feedback remarks.

---

### Module 5: Broadsheets, Class Rankings & Report Cards
26. **Automated Broadsheet Generation:** 1-click aggregation of all student subject marks across the entire class.
27. **Class Position Ranking:** Tie-aware computation of overall student positions (1st, 2nd, 3rd... out of N students).
28. **End-of-Year Promotion Engine:** Batch evaluation of minimum pass averages, promoting qualified students to the next class tier or flagging repeaters.
29. **Form Master & Principal Remarks:** Qualitative behavioral assessments (Cognitive, Affective, Psychomotor ratings) and sign-off comments.
30. **Tamper-Proof Report Card Printing:** Printable A4 terminal report cards featuring the official school crest, attendance summaries, subject breakdowns, and **cryptographic verification QR codes**.
31. **Fee-Based Result Lock (Debtor Protection):** Automatic lock preventing students with outstanding tuition balances from viewing or printing report cards until cleared.

---

### Module 6: Bursary, Fees & Financial Clearing
32. **Termly Invoice Generation:** Automated creation of student invoices itemizing Tuition, ICT levies, Science Lab fees, and PTA dues in integer Kobo.
33. **Online Paystack Payment Gateway:** Direct debit card, bank transfer, and USSD payments with HMAC SHA-512 webhook confirmation.
34. **Bank Transfer Receipt Upload:** Parents upload photos/PDFs of bank payment tellers with reference numbers for offline settlements.
35. **Bursar Audit Approval Queue:** Side-by-side reconciliation interface where bursars verify uploaded bank tellers against bank statements and click `Approve` or `Reject` with mandatory feedback.
36. **Official Digital Receipting:** Instant generation of numbered payment receipts upon confirmation.
37. **Debtors Ledger:** Filterable directory of outstanding balances with class-by-class debt summaries.
38. **Bursar Discretionary Clearance:** Manual override allowing bursars to grant conditional result viewing access to students with payment plans.

---

### Module 7: Computer-Based Testing (CBT) Engine
39. **Multi-Question Exam Authoring:** Teachers create exams with multiple-choice questions (Options A, B, C, D), correct option radio selectors, and point weights.
40. **Live Countdown Examination Timer:** Student testing room featuring a persistent second-by-second countdown clock.
41. **Auto-Submit on Timer Expiration:** Automated answer submission the instant the exam timer reaches `00:00`.
42. **Interactive Question Palette:** Student question navigation grid displaying Answered (blue), Current (active), and Unanswered (gray) states.
43. **Instant Automated Grading:** Real-time scoring calculation displaying total score, percentage, passing threshold, and pass/fail status.
44. **Cheat Prevention Security:** Hiding answer keys and correct options from API responses until exams are submitted.

---

### Module 8: Staff Payroll & Operating Expenses
45. **Monthly Staff Payroll Execution:** Single-click calculation of staff salaries.
46. **Statutory Deductions Engine:** Automated computation of:
    - **Basic Salary**
    - **Housing Allowance** & **Transport Allowance**
    - **Statutory Pension (8%)**
    - **PAYE Withholding Tax**
    - **Net Salary Payable**
47. **Digital Payslip Generation:** Printable, individual staff payslips with itemized earning and deduction vouchers.
48. **Operational Disbursement Ledger:** Recording school operating expenses (Diesel/Generator, Science Reagents, Internet, Repairs, Sports) with Payment Voucher (PV) numbers and payee details.

---

### Module 9: Sick Bay & Student Health Records
49. **Clinical Encounter Logging:** School nurse records date, student ID, symptoms, diagnosis, and treatment administered.
50. **Vital Signs Tracking:** Monitoring body temperature (°C) and blood pressure.
51. **Bed Admission Tracking:** Monitoring overnight or day-rest admissions in the school clinic.
52. **Parent Medical Advisories:** Instant alert toggle notifying parents when their child visits the sick bay.

---

### Module 10: School Stores & Inventory Management
53. **Stock Cataloging:** Tracking uniforms, sports wear, textbooks, exercise books, and laboratory equipment.
54. **Stock Replenishment & Unit Cost Tracking:** Logging supplier purchase costs and quantities received.
55. **Automatic Re-Order Alerts:** Visual warning badges (`Out of Stock`, `Low Stock`, `Adequate`) triggered when stock drops below threshold numbers.

---

### Module 11: Extracurricular Clubs & Societies
56. **Club Chartering:** Administrative directory for clubs (JET Club, Literary & Debating, Red Cross, Press Club, Robotics).
57. **Patron & Meeting Schedule Assignment:** Defining faculty patrons, meeting venues, and schedules.
58. **1-Click Student Enrollment:** Students browse active clubs and join with single-click membership.

---

### Module 12: External Examinations Registry
59. **National Examination Enrollment:** Candidate registration console for **WAEC (WASSCE)**, **NECO (SSCE)**, **BECE (Junior WAEC)**, and **NCEE (Common Entrance)**.
60. **Candidate Number & Centre Tracking:** Managing official exam body registration numbers and examination centres.
61. **Biometric Photocard Verification:** Validation of registered candidate passport photos.

---

### Module 13: Library & E-Resources
62. **Book Cataloging:** Indexing books by ISBN, title, author, category, and shelf location.
63. **Circulation Loan Management:** Issuing books to students with due-date tracking and return logging.
64. **Overdue Fine Computation:** Flagging unreturned books and tracking library dues.
65. **Digital E-Resources:** Repository for syllabus PDFs, e-books, and past examination question papers.

---

### Module 14: Communication & Parent Helpdesk
66. **Official Circular Broadcasting:** Admin and teachers publish announcements with target audience filtering (`All`, `Parents`, `Teachers`, `Students`).
67. **Threaded Internal Messaging:** Direct messaging between parents and class teachers.
68. **Notification Center:** Dropdown bell indicator with unread counters for fee reminders, grades, and circulars.
69. **Helpdesk Support Ticketing:** Parents and students submit inquiries/issues with tracking codes and admin resolution states.

---

### Module 15: Progressive Web App (PWA) & Mobile Capabilities
70. **Mobile Home-Screen Installation:** Web App Manifest (`public/manifest.json`) enabling parents, students, and teachers to install the portal as a standalone app on Android and iOS devices.
71. **Responsive Viewports:** Adapts from 360px smartphones up to multi-monitor 4K displays.

---

## 4. Summary of Functions by Role Matrix

| User Role | Total Functions Accessible | Primary Operational Capabilities |
|---|:---:|---|
| **Super Admin / Proprietor** | **All 71 Functions** | Complete institutional governance, multi-tenant settings, and system-wide audit verification. |
| **School Admin / Principal** | **52 Functions** | Admissions approval, academic calendar, staff allocations, class promotions, broadsheets, clubs. |
| **Bursar / Accountant** | **22 Functions** | Fee invoices, Paystack settlements, bank receipt approvals, staff payroll, operating expenses. |
| **Teacher / Form Master** | **26 Functions** | 1-click attendance, CA 20+20+60 score sheets, assignments, report remarks, CBT authoring. |
| **Parent / Guardian** | **18 Functions** | Multi-child switcher, attendance monitoring, Paystack fee payment, receipt upload, report cards. |
| **Student** | **15 Functions** | Timetables, homework submission, live timed CBT testing, report cards, club enrollment. |
| **Librarian / Storekeeper** | **12 Functions** | Book cataloging, circulation loans, uniform/store inventory, re-order threshold alerts. |
| **School Medical Officer** | **8 Functions** | Sick bay encounters, vital signs logging, bed admission tracking, parent health alerts. |
