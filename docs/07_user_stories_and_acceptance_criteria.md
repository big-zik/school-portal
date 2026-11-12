# 📖 User Stories & Acceptance Criteria: School Portal

**Document ID:** DOC-REQ-002  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** Agile Requirements Team  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Agile Product Owner | Role-tailored user stories with testable acceptance criteria | Approved |

---

## 2. User Stories by Persona

### 2.1 Student User Stories

#### US-STU-01: Viewing Daily Timetable
> **As a** student,  
> **I want to** view my daily and weekly class schedule on my smartphone or computer,  
> **So that** I know which classroom to attend and what textbooks and materials to prepare.
- **Acceptance Criteria:**
  - Schedule displays day-by-day periods, subjects, time slots, room numbers, and teacher names.
  - Current ongoing period is highlighted visually with a live badge.
  - Responsive layout adapts smoothly to smartphone screens.

#### US-STU-02: Submitting Homework Online
> **As a** student,  
> **I want to** submit my homework text or upload attachment files before the deadline,  
> **So that** my subject teacher can review and grade my work.
- **Acceptance Criteria:**
  - Student can upload supported document types (PDF, DOCX, PNG, JPG) up to 10MB.
  - System logs exact submission timestamp.
  - Submissions after the deadline are clearly flagged as "Late Submission".
  - Student receives confirmation notice upon successful submission.

#### US-STU-03: Taking Timed CBT Quizzes
> **As a** student,  
> **I want to** take multiple-choice CBT tests with a live countdown timer,  
> **So that** I can test my knowledge and prepare for external WAEC/JAMB examinations.
- **Acceptance Criteria:**
  - Countdown timer decrements second-by-second in sync with test duration.
  - Interactive question grid shows answered, current, and unanswered question numbers.
  - System automatically submits all answers when timer reaches 00:00.
  - Instant score card displays total points, percentage, and passing status upon submission.

#### US-STU-04: Checking Terminal Results
> **As a** student,  
> **I want to** check my terminal exam scores and download my official report card,  
> **So that** I can track my academic progress.
- **Acceptance Criteria:**
  - If school fees are fully paid, student can view subject grades and download PDF report card.
  - If school fees have an outstanding balance, screen displays **Fee-Based Result Lock** and balance owed.

---

### 2.2 Parent User Stories

#### US-PAR-01: Tracking Student Attendance
> **As a** parent,  
> **I want to** monitor my child's daily attendance records,  
> **So that** I am immediately informed if my child is absent or late to school.
- **Acceptance Criteria:**
  - Parent can view attendance history by term, month, and date.
  - Summary cards show total days Present, Absent, Late, and Excused.
  - System triggers an immediate alert when an unexcused absence is registered.

#### US-PAR-02: Paying School Fees Online
> **As a** parent,  
> **I want to** settle termly school fees using my debit card or bank transfer through Paystack,  
> **So that** I avoid visiting banking halls or carrying cash.
- **Acceptance Criteria:**
  - Invoice itemizes tuition, ICT dues, sports fees, and laboratory levies in Naira.
  - Parent clicks "Pay with Paystack" and completes payment securely.
  - Invoice status changes instantly to `PAID` upon successful webhook confirmation.
  - Official digital receipt is generated with unique receipt reference number.

#### US-PAR-03: Uploading Bank Transfer Receipts
> **As a** parent,  
> **I want to** upload a photo or PDF of my bank transfer payment receipt,  
> **So that** the school bursar can verify and credit my child's tuition balance.
- **Acceptance Criteria:**
  - Parent inputs bank name, transfer reference/teller number, amount paid, and uploads file.
  - Payment is queued with status `PENDING` (Under Review).
  - Parent receives notification once the bursar approves or rejects the receipt.

---

### 2.3 Teacher User Stories

#### US-TCH-01: Taking Daily Attendance
> **As a** class teacher,  
> **I want to** take morning attendance with a fast one-click interface,  
> **So that** roll-call takes less than two minutes.
- **Acceptance Criteria:**
  - Default status for all enrolled students is preset to `PRESENT`.
  - Teacher clicks single buttons to mark specific students `ABSENT` or `LATE`.
  - Attendance log updates in database immediately upon saving.

#### US-TCH-02: Recording Continuous Assessment Marks
> **As a** subject teacher,  
> **I want to** enter CA 1, CA 2, and Exam scores in a spreadsheet-like grid,  
> **So that** I don't have to calculate totals and letter grades manually.
- **Acceptance Criteria:**
  - Score sheet validates input constraints (CA 1 $\le 20$, CA 2 $\le 20$, Exam $\le 60$).
  - System auto-computes Total (0-100) and displays WAEC letter grade (A1 to F9) instantly.
  - Input prevents numbers greater than allowed maximums or negative values.

---

### 2.4 Administrator User Stories

#### US-ADM-01: Bursar Bank Receipt Approval
> **As a** bursar,  
> **I want to** review uploaded bank receipts and match them against school bank statements,  
> **So that** student fee ledgers are credited accurately without fraud.
- **Acceptance Criteria:**
  - Approval queue displays parent name, student ID, bank reference, amount, and receipt image.
  - Bursar clicks "Approve" to clear the invoice and generate an official receipt.
  - Bursar clicks "Reject" with mandatory feedback reason explaining rejection to the parent.
  - All approval and rejection events are written to the audit log.

#### US-ADM-02: Running Staff Monthly Payroll
> **As a** school administrator / bursar,  
> **I want to** execute monthly staff payroll with automated statutory deductions,  
> **So that** staff salaries and payslips are processed on time.
- **Acceptance Criteria:**
  - System calculates Basic Salary, Housing and Transport Allowances.
  - System deducts 8% statutory Pension contribution and PAYE withholding tax.
  - Individual digital payslips are generated and downloadable.
