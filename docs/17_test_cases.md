# 📋 Software Test Cases: School Portal

**Document ID:** DOC-TEST-002  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** Test Engineering Team  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Senior Test Engineer | Comprehensive test case matrix covering all primary operational flows | Approved |

---

## 2. Test Cases Execution Matrix

| TC ID | Module | Test Title | Preconditions | Steps | Expected Result | Actual Result | Status | Priority |
|---|---|---|---|---|---|---|:---:|:---:|
| **TC-01** | Auth | Login with Valid Credentials | User exists in DB | 1. Enter email<br>2. Enter password<br>3. Click Sign In | Redirect to role dashboard with active session cookie | Redirected to correct role dashboard | **PASS** | High |
| **TC-02** | Auth | Login with Invalid Password | User exists in DB | 1. Enter valid email<br>2. Enter wrong password<br>3. Submit | Returns 401 Unauthorized; displays error banner | 401 Unauthorized displayed | **PASS** | High |
| **TC-03** | Auth | Password Reset Request | User email registered | 1. Navigate to `/forgot-password`<br>2. Enter email<br>3. Submit | Reset token generated and email dispatched | Reset link confirmed | **PASS** | Medium |
| **TC-04** | Security | Role-Based Access Isolation | Student session active | 1. Attempt navigating to `/admin/payroll` | Middleware intercepts request; redirects to `/unauthorized` | Redirected to `/unauthorized` | **PASS** | Critical |
| **TC-05** | Admissions | Prospective Student Application | Public portal active | 1. Visit `/admissions/apply`<br>2. Fill bio-data<br>3. Submit | Returns application code (e.g. `ADM-2026-XXXX`) | Application code generated | **PASS** | High |
| **TC-06** | Admissions | Application Approval & Student Account Creation | Pending admission application | 1. Admin reviews app<br>2. Clicks `ACCEPT`<br>3. Confirms | Student matriculation number generated; student record created | Matriculation number created | **PASS** | High |
| **TC-07** | Attendance | Daily Attendance Roll-Call | Class roster populated | 1. Open `/teacher/attendance`<br>2. Toggle student to `ABSENT`<br>3. Save | Attendance persisted; absent alert dispatched | Attendance recorded; parent alert sent | **PASS** | High |
| **TC-08** | Assignments | Homework Assignment Creation | Teacher assigned to class | 1. Open `/teacher/assignments`<br>2. Enter title, marks, due date<br>3. Save | Assignment listed; student notification triggered | Assignment visible in student feed | **PASS** | Medium |
| **TC-09** | Assignments | Homework Online Submission | Assignment published | 1. Student opens homework<br>2. Inputs answer / uploads PDF<br>3. Submit | Submission recorded with timestamp; status `SUBMITTED` | Submission logged in teacher inbox | **PASS** | High |
| **TC-10** | Assignments | Late Homework Submission Flag | Past due date | 1. Student submits homework 1 hour after deadline | Submission accepted but flagged with `LATE` status | Marked as `LATE` | **PASS** | Medium |
| **TC-11** | Grading | Continuous Assessment Marks Entry | Examination session open | 1. Teacher inputs CA1: 18, CA2: 17, Exam: 55<br>2. Save | Total calculated as 90; Grade displayed as `A1` | Total: 90, Grade: A1 saved | **PASS** | Critical |
| **TC-12** | Grading | CA Score Upper-Bound Validation | CA entry active | 1. Input CA1 score of 25 (max is 20) | System rejects input or prevents submission with validation error | Input rejected with alert | **PASS** | High |
| **TC-13** | Results | Terminal Broadsheet & Class Ranking | All class grades entered | 1. Admin clicks "Compute Broadsheet"<br>2. Verify rankings | Broadsheet ranks students by cumulative percentage | Broadsheet compiled with 1st, 2nd, 3rd | **PASS** | Critical |
| **TC-14** | Results | Fee-Based Result Lock (Unpaid Student) | Student owes tuition | 1. Student attempts viewing report card | System renders **Fee-Based Result Lock** and invoice checkout link | Results locked with fee alert | **PASS** | Critical |
| **TC-15** | Results | Fee-Based Result Unlock (Cleared Student) | Student tuition fully settled | 1. Cleared student opens `/student/results` | System renders official report card with remarks and QR verification | Report card rendered and printable | **PASS** | Critical |
| **TC-16** | Payments | Paystack Online Checkout Flow | Unpaid invoice exists | 1. Click "Pay Online"<br>2. Complete Paystack test payment | Webhook verifies signature; marks invoice `PAID`; unlocks results | Invoice marked `PAID`; results unlocked | **PASS** | Critical |
| **TC-17** | Payments | Bank Payment Receipt Upload & Approval | Bank deposit made | 1. Parent uploads teller receipt<br>2. Bursar clicks "Approve" in queue | Payment marked `COMPLETED`; official receipt generated | Payment approved; receipt issued | **PASS** | High |
| **TC-18** | CBT | CBT Auto-Submit upon Timer Expiry | Live CBT quiz in progress | 1. Student enters test room<br>2. Timer counts down to 00:00 | Answers auto-submitted; score card computed instantly | Instant score card displayed | **PASS** | Critical |
| **TC-19** | Payroll | Staff Monthly Payroll Deductions | Active staff roster | 1. Bursar runs payroll with Basic = NGN 150,000 | System computes Housing, Transport, 8% Pension, and PAYE tax | Net pay and payslips generated | **PASS** | High |
| **TC-20** | Inventory | Low Stock Re-Order Alert Trigger | Store items cataloged | 1. Stock quantity falls below re-order threshold | Item flagged with amber "Low Stock" warning badge | Low stock badge rendered | **PASS** | Medium |
| **TC-21** | UI | Mobile Viewport Responsiveness | Viewport width 375px | 1. Open portal on iPhone viewport<br>2. Inspect navigation & forms | Layout collapses to single column; hamburger drawer functions | Responsive layout verified | **PASS** | High |
