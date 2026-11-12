# 🎭 Use Cases Specification: School Portal

**Document ID:** DOC-USE-001  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** Requirements Engineering Team  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Senior Systems Analyst | Detailed use-case specifications for 19 core workflows | Approved |

---

## 2. Table of Core Use Cases

| UC ID | Use Case Title | Primary Actor | Target Module |
|---|---|---|---|
| **UC-01** | Student Registration & Login | Student | Authentication & Identity |
| **UC-02** | Parent Registration & Child Linkage | Parent / Guardian | Parent Management |
| **UC-03** | Teacher Login & Class Access | Teacher | Academic Setup |
| **UC-04** | Administrator User Management | School Administrator | User Administration |
| **UC-05** | Student Admission Application & Approval | Prospective Student / Admin | Admissions Engine |
| **UC-06** | Daily Attendance Roll-Call | Teacher | Attendance |
| **UC-07** | Assignment Creation | Teacher | Assignments |
| **UC-08** | Homework / Assignment Submission | Student | Assignments |
| **UC-09** | Assignment Grading & Feedback | Teacher | Continuous Assessment |
| **UC-10** | Continuous Assessment (CA) & Exam Entry | Teacher | Continuous Assessment |
| **UC-11** | Terminal Result Generation & Ranking | Admin / Teacher | Broadsheet & Results |
| **UC-12** | Report Card Generation & Print | Student / Parent / Admin | Academic Reports |
| **UC-13** | Termly Fee Invoice Creation | Bursar / Accountant | Bursary & Finance |
| **UC-14** | Online Fee Payment (Paystack) | Parent / Guardian | Bursary & Finance |
| **UC-15** | Bank Payment Receipt Upload & Approval | Parent / Bursar | Bursary & Finance |
| **UC-16** | School Announcement Publication | Administrator / Teacher | Communication |
| **UC-17** | Real-Time Internal Messaging | All Authenticated Users | Communication |
| **UC-18** | Academic & Policy Document Management | Administrator | Document Vault |
| **UC-19** | Library Book Issue & Return | Librarian | Library Management |

---

## 3. Detailed Use Case Specifications

---

### UC-01: Student Registration & Login
- **Use Case ID:** UC-01
- **Actor:** Student
- **Preconditions:** Student account provisioned by administrator or through admission acceptance.
- **Main Flow:**
  1. Student navigates to `/login`.
  2. Enters student email or matriculation number and password.
  3. System validates credentials against `User` table using bcrypt compare.
  4. System verifies that student role is active and checks enrollment status.
  5. System generates encrypted NextAuth session cookie.
  6. Student is redirected to `/student` dashboard.
- **Alternative Flow:**
  - *2a.* Student forgets password: clicks "Forgot Password?", enters email, receives reset link, updates password.
- **Exception Flow:**
  - *3a.* Invalid credentials: system returns 401 error "Invalid email or password", increments failed attempt count.
  - *4a.* Account suspended: system displays suspension advisory with administrative contact info.
- **Postconditions:** Student successfully authenticated and session initialized.
- **Acceptance Criteria:** Session cookie secure, HTTP-only, and redirects strictly to student role path.

---

### UC-02: Parent Registration & Child Linkage
- **Use Case ID:** UC-02
- **Actor:** Parent / Guardian
- **Preconditions:** Parent account exists or is self-registered via `/register`.
- **Main Flow:**
  1. Parent logs into `/parent`.
  2. Navigates to "My Children" tab and clicks "Link Child / Ward".
  3. Enters student admission number and date of birth or student verification PIN.
  4. System queries `Student` and verifies admission credentials.
  5. System establishes relationship in `StudentGuardian` junction table.
  6. Parent dashboard refreshes displaying linked student's profile, attendance, and fees.
- **Alternative Flow:**
  - *3a.* Parent has multiple children: repeats flow to link additional students to the same parent account.
- **Exception Flow:**
  - *4a.* Admission number not found: system displays error "No student found matching these credentials".
  - *4b.* Child already linked: system informs parent that linkage is already active.
- **Postconditions:** Parent authorized to view linked ward's academic records, fee invoices, and attendance logs.
- **Acceptance Criteria:** Parent cannot view records of any non-linked students under any circumstance.

---

### UC-03: Teacher Login & Class Access
- **Use Case ID:** UC-03
- **Actor:** Teacher
- **Preconditions:** Teacher account active and assigned to one or more classes and subjects in `ClassSubject`.
- **Main Flow:**
  1. Teacher logs in via `/login`.
  2. Redirected to `/teacher` dashboard.
  3. Dashboard renders assigned classes, subjects, today's schedule, and pending grading count.
  4. Teacher selects specific class (e.g. JSS 2A - Mathematics) to view enrolled student roster.
- **Alternative Flow:**
  - *4a.* Teacher is also a Form Master: dashboard provides additional class broadsheet and attendance controls.
- **Exception Flow:**
  - *3a.* No classes assigned yet: displays empty state "Contact administrator to assign classes".
- **Postconditions:** Teacher granted access to assigned class score sheets, homework submissions, and attendance logs.
- **Acceptance Criteria:** Teacher restricted from editing marks for classes/subjects they are not designated to teach.

---

### UC-04: Administrator User Management
- **Use Case ID:** UC-04
- **Actor:** School Administrator / Principal
- **Preconditions:** Administrator authenticated with `ADMIN` or `SUPER_ADMIN` role.
- **Main Flow:**
  1. Admin navigates to `/admin/users` or `/admin/students` / `/admin/teachers`.
  2. Views filtered directory of all staff, teachers, students, and parents.
  3. Clicks "Add New User" and fills in name, email, role, phone number, and designation.
  4. System creates record in `User` and `UserRole` tables with temporary password.
  5. System logs audit event `CREATE_USER` in `AuditLog`.
  6. Admin can edit, deactivate, or reset password for any account.
- **Postconditions:** New user account created with correct RBAC role.
- **Acceptance Criteria:** Action logged with admin ID, timestamp, and target user entity.

---

### UC-05: Student Admission Application & Approval
- **Use Case ID:** UC-05
- **Actor:** Prospective Student/Parent (Applicant) & School Administrator
- **Preconditions:** Public admissions portal active for the current academic session.
- **Main Flow:**
  1. Applicant visits `/admissions/apply` on the public website.
  2. Fills in applicant bio-data, desired entry class, previous school transcripts, and parent contact details.
  3. Submits application; system generates application tracking code (e.g. `ADM-2026-XXXX`).
  4. Administrator navigates to `/admin/admissions` to review incoming applications.
  5. Admin reviews documents, updates status to `UNDER_REVIEW`, `OFFERED`, or `ACCEPTED`.
  6. Upon clicking `ACCEPT`, system automatically generates student matriculation number and provisions portal user account.
- **Postconditions:** Applicant converted to active enrolled student.
- **Acceptance Criteria:** Student record created in `Student` table and linked to target class.

---

### UC-06: Daily Attendance Roll-Call
- **Use Case ID:** UC-06
- **Actor:** Teacher / Form Master
- **Preconditions:** Academic session and term are active; class roster populated.
- **Main Flow:**
  1. Teacher navigates to `/teacher/attendance` and selects class and date.
  2. System loads student list, defaulting all statuses to `PRESENT`.
  3. Teacher toggles status for absent (`ABSENT`), tardy (`LATE`), or excused (`EXCUSED`) students.
  4. Teacher clicks "Save Attendance".
  5. System persists records into `Attendance` table and creates notifications for parents of absent students.
- **Postconditions:** Daily attendance records saved and aggregated into term summaries.
- **Acceptance Criteria:** Parents receive real-time alert for unexcused absences.

---

### UC-07: Assignment Creation
- **Use Case ID:** UC-07
- **Actor:** Teacher
- **Preconditions:** Teacher assigned to class and subject.
- **Main Flow:**
  1. Teacher navigates to `/teacher/assignments` and clicks "New Assignment".
  2. Fills in assignment title, subject, target class, instructions, total marks, and due date.
  3. Optionally attaches reference PDF or learning material.
  4. Clicks "Publish Assignment".
  5. System writes to `Assignment` table and dispatches notification to all enrolled students.
- **Postconditions:** Assignment live and visible in student homework feed.
- **Acceptance Criteria:** Due dates enforce submission deadline boundaries.

---

### UC-08: Homework / Assignment Submission
- **Use Case ID:** UC-08
- **Actor:** Student
- **Preconditions:** Assignment published and student enrolled in the target class.
- **Main Flow:**
  1. Student navigates to `/student/assignments`.
  2. Opens pending assignment details and instructions.
  3. Enters written submission or uploads homework document/attachment.
  4. Clicks "Submit Assignment".
  5. System records submission in `Submission` table with timestamp; status set to `SUBMITTED`.
- **Alternative Flow:**
  - *4a.* Submission after deadline: system flags submission with `LATE` status.
- **Postconditions:** Submission queued in teacher's grading inbox.
- **Acceptance Criteria:** Student can view confirmation timestamp and submission content.

---

### UC-09: Assignment Grading & Feedback
- **Use Case ID:** UC-09
- **Actor:** Teacher
- **Preconditions:** Students have submitted homework for a published assignment.
- **Main Flow:**
  1. Teacher navigates to `/teacher/assignments/[id]`.
  2. Views list of student submissions with submission timestamps and files.
  3. Inputs score (0 to maximum points) and qualitative teacher feedback remarks.
  4. Clicks "Submit Grade".
  5. System saves grade into `Grade` and `Submission` records, notifying the student.
- **Postconditions:** Student grade updated and viewable in student dashboard.
- **Acceptance Criteria:** Grade cannot exceed maximum defined score.

---

### UC-10: Continuous Assessment (CA) & Exam Entry
- **Use Case ID:** UC-10
- **Actor:** Subject Teacher
- **Preconditions:** Examination session open for grade entry by administrator.
- **Main Flow:**
  1. Teacher navigates to `/teacher/grades/ca-entry`.
  2. Selects class (e.g. SS 1 Science) and subject (e.g. Physics).
  3. Interactive score sheet displays student list with input columns: CA 1 (Max 20), CA 2 (Max 20), Exam (Max 60).
  4. Teacher inputs scores; sheet automatically calculates Total (0-100) and displays real-time Letter Grade (A1 to F9).
  5. Teacher clicks "Save Continuous Assessment Scores".
  6. System persists records into `Result` and `AuditLog` tables.
- **Postconditions:** Academic scores stored and ready for terminal broadsheet compilation.
- **Acceptance Criteria:** System rejects scores exceeding individual component maximums.

---

### UC-11: Terminal Result Generation & Ranking
- **Use Case ID:** UC-11
- **Actor:** School Administrator / Form Master
- **Preconditions:** All subject teachers have submitted CA and examination scores for the term.
- **Main Flow:**
  1. Admin opens `/admin/examinations/results`.
  2. Selects academic session, term, and class.
  3. Clicks "Compute Broadsheet & Class Rankings".
  4. System executes aggregation algorithm calculating total marks, subject averages, and positions (1st, 2nd, 3rd, etc.).
  5. Admin reviews broadsheet and clicks "Publish Terminal Results".
- **Postconditions:** Official results published and accessible to cleared students and parents.
- **Acceptance Criteria:** Ties in class positions handled consistently according to academic guidelines.

---

### UC-12: Report Card Generation & Print
- **Use Case ID:** UC-12
- **Actor:** Student, Parent, Administrator
- **Preconditions:** Terminal results published by administrator.
- **Main Flow:**
  1. User navigates to `/student/results` or `/parent/results`.
  2. Selects term and clicks "Generate Official Report Card".
  3. System evaluates financial clearance (`isClearedForResults`).
  4. If cleared, system renders official terminal report card with school crest, subject grades, CA breakdowns, attendance summary, form master remarks, principal endorsement, and verification QR code.
  5. User prints or downloads digital PDF copy.
- **Exception Flow:**
  - *3a.* Student has outstanding fee balance: system triggers **Fee-Based Result Lock**, displaying balance owed and a direct link to Paystack fee checkout.
- **Postconditions:** Report card successfully rendered or access denied based on bursary status.
- **Acceptance Criteria:** Unpaid students strictly blocked from viewing or printing report card.

---

### UC-13: Termly Fee Invoice Creation
- **Use Case ID:** UC-13
- **Actor:** Bursar / Accountant
- **Preconditions:** Academic session and term fee categories defined.
- **Main Flow:**
  1. Bursar navigates to `/admin/fees` and clicks "Generate Term Invoices".
  2. Selects target classes or all enrolled students.
  3. Selects applicable fee components (Tuition, ICT levy, Science Lab, PTA dues).
  4. System generates customized `Invoice` and `InvoiceItem` records with unique invoice numbers (e.g. `INV-2026-XXXX`).
  5. System dispatches billing notification to all parents.
- **Postconditions:** Invoices active and payable in parent portals.
- **Acceptance Criteria:** Invoices reflect accurate amounts in whole kobo.

---

### UC-14: Online Fee Payment (Paystack)
- **Use Case ID:** UC-14
- **Actor:** Parent / Guardian
- **Preconditions:** Active pending invoice exists on parent account.
- **Main Flow:**
  1. Parent visits `/parent/fees` and selects invoice to settle.
  2. Clicks "Pay Online with Paystack".
  3. System calls `/api/payments/paystack/initialize` generating secure payment reference.
  4. Parent completes payment on Paystack checkout modal (Card, Bank Transfer, USSD).
  5. Paystack webhook calls `/api/webhooks/paystack` with transaction confirmation.
  6. System verifies HMAC SHA-512 signature, marks `Invoice` as `PAID`, creates `Payment` record, and unlocks student results.
- **Postconditions:** Payment confirmed, digital receipt generated, fees balance set to zero.
- **Acceptance Criteria:** Webhook processing is idempotent and immune to replay attacks.

---

### UC-15: Bank Payment Receipt Upload & Approval
- **Use Case ID:** UC-15
- **Actor:** Parent / Guardian & Bursar
- **Preconditions:** Parent has performed offline direct bank deposit or wire transfer to school account.
- **Main Flow:**
  1. Parent visits `/parent/fees`, opens invoice, and clicks "Upload Bank Receipt".
  2. Fills in bank name, payment reference/teller number, amount paid, and uploads receipt image/PDF.
  3. System records payment with status `PENDING` (awaiting verification).
  4. Bursar navigates to `/admin/fees/approvals` queue.
  5. Bursar inspects uploaded receipt against bank statement, enters approval notes, and clicks "Approve".
  6. System transitions payment to `COMPLETED`, updates invoice balance, and issues official receipt.
- **Alternative Flow:**
  - *5a.* Receipt invalid or unverified: Bursar clicks "Reject", enters rejection reason; parent notified to re-upload.
- **Postconditions:** Offline payment audited, verified, and officially credited to student ledger.
- **Acceptance Criteria:** Dual approval trail logged in `AuditLog` with bursar user ID.

---

### UC-16: School Announcement Publication
- **Use Case ID:** UC-16
- **Actor:** Administrator / Principal / Teacher
- **Preconditions:** User has administrative or teacher announcement publishing privileges.
- **Main Flow:**
  1. User navigates to `/admin/announcements` or `/teacher/announcements`.
  2. Clicks "New Announcement" and specifies title, body content, priority (Normal/Urgent), and audience (All, Parents, Teachers, Students).
  3. Clicks "Broadcast Announcement".
  4. System persists into `Announcement` table and dispatches real-time notification alerts.
- **Postconditions:** Announcement displayed in recipient dashboards and notification panels.
- **Acceptance Criteria:** Target filtering restricts visibility strictly to designated audiences.

---

### UC-17: Real-Time Internal Messaging
- **Use Case ID:** UC-17
- **Actor:** All Authenticated Users (Teacher, Parent, Student, Admin)
- **Preconditions:** Senders and recipients are active users within the institution.
- **Main Flow:**
  1. User navigates to `/messages`.
  2. Selects existing conversation or clicks "New Message".
  3. Selects recipient (e.g. Parent selecting child's Class Teacher).
  4. Types message text and clicks "Send".
  5. System records message in `Message` table and updates unread badge counter for recipient.
- **Postconditions:** Message delivered and stored in threaded communication history.
- **Acceptance Criteria:** Users cannot message accounts outside allowed organizational boundaries.

---

### UC-18: Academic & Policy Document Management
- **Use Case ID:** UC-18
- **Actor:** Administrator
- **Preconditions:** Admin privileges active.
- **Main Flow:**
  1. Admin opens `/admin/documents`.
  2. Clicks "Upload Document", enters title, category (Handbook, Calendar, Policy, Form), and selects PDF file.
  3. System validates file mime type and size, storing file metadata in `Document` table.
  4. Document becomes available for download across authorized role dashboards.
- **Postconditions:** Document indexed and downloadable by target roles.
- **Acceptance Criteria:** File upload blocks dangerous file extensions (`.exe`, `.sh`, `.bat`).

---

### UC-19: Library Book Issue & Return
- **Use Case ID:** UC-19
- **Actor:** Librarian
- **Preconditions:** Book cataloged in `Book` table; student active.
- **Main Flow:**
  1. Librarian navigates to `/admin/library/loans`.
  2. Clicks "Issue Book Loan", enters ISBN or scans barcode, and enters student admission number.
  3. Specifies due date (default: 14 days) and confirms loan.
  4. System creates record in `BookLoan` and decrements available book copy count.
  5. When student returns book, librarian marks loan as `RETURNED`; copy count restored.
- **Postconditions:** Book loan ledger accurately updated and available stock synchronized.
- **Acceptance Criteria:** System flags overdue loans with outstanding fine calculations.
