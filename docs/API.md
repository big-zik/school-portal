# 🏫 School Portal REST API Documentation

This document describes the API endpoints provided by the School Portal.

All endpoints require a valid session token (via NextAuth session cookie or `Authorization: Bearer <token>`) unless marked **Public**.

---

## 1. Authentication & Security

### `POST /api/auth/signin`
Authenticate a user with credentials.
- **Request Body:**
  ```json
  {
    "email": "student.daniel@school.com",
    "password": "Password@123"
  }
  ```
- **Response `200 OK`:** Sets `authjs.session-token` cookie and returns user profile:
  ```json
  {
    "user": {
      "id": "cuid-1",
      "email": "student.daniel@school.com",
      "name": "Daniel Johnson",
      "roles": ["STUDENT"]
    }
  }
  ```
- **Error `401 Unauthorized`:** Invalid credentials, account lockout alert (after 5 failed attempts).

---

## 2. Students & Enrolment

### `GET /api/students`
List students with filtering by class or term.
- **Query Parameters:**
  - `classId` (string, optional)
  - `page` (number, default: 1)
  - `limit` (number, default: 20)
  - `search` (string, optional)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "stu-1",
        "studentId": "STU2024001",
        "user": { "name": "Daniel Johnson", "email": "student.daniel@school.com" },
        "currentClass": { "name": "Grade 10 (SS 1)" },
        "status": "ACTIVE"
      }
    ]
  }
  ```

---

## 3. Attendance Management

### `POST /api/attendance`
Submit batch attendance for a class period.
- **Permission:** `TEACHER`, `ADMIN`, `SUPER_ADMIN`
- **Request Body:**
  ```json
  {
    "classId": "class-grade-10",
    "subjectId": "sub-math-101",
    "date": "2025-02-15",
    "records": [
      { "studentId": "stu-1", "status": "PRESENT" },
      { "studentId": "stu-2", "status": "LATE", "remarks": "Bus traffic delay" },
      { "studentId": "stu-3", "status": "EXCUSED", "remarks": "Medical clinic visit" }
    ]
  }
  ```
- **Response `200 OK`:**
  ```json
  { "success": true, "count": 3 }
  ```
- **Side Effects:** Automatically dispatches SMS/email absence alerts to parents of late/absent students.

---

## 4. Assignments & Coursework

### `GET /api/assignments`
List assignments for a class or student.
- **Query Parameters:** `classId`, `subjectId`, `status`
- **Response `200 OK`:** List of assignments with title, instructions, attachments, deadlines, and submissions.

### `POST /api/submissions`
Submit completed coursework document.
- **Permission:** `STUDENT`
- **Request Body:**
  ```json
  {
    "assignmentId": "asg-1",
    "files": [{ "name": "Report.pdf", "url": "https://s3.../Report.pdf" }],
    "remarks": "Completed all proofs."
  }
  ```

---

## 5. Fees & Invoicing

### `GET /api/fees`
Retrieve fee ledger and invoice statuses.
- **Permission:** `PARENT` (own children), `ADMIN`, `ACCOUNTANT`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "invoiceNumber": "INV-2025-00142",
        "totalAmount": 285000,
        "paidAmount": 285000,
        "balanceAmount": 0,
        "status": "PAID",
        "dueDate": "2025-01-31"
      }
    ]
  }
  ```

---

## 6. Audit Trail

### `GET /api/audit-logs`
Search immutable forensic log of all actions.
- **Permission:** `SUPER_ADMIN`
- **Query Parameters:** `action`, `module`, `userId`, `startDate`, `endDate`
- **Response `200 OK`:** Full historical records with before/after JSON states.
