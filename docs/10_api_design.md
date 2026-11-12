# 🌐 REST API Design & Specification: School Portal

**Document ID:** DOC-API-001  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** API Architecture Team  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Principal API Architect | Complete REST API reference covering all operational modules | Approved |

---

## 2. Global API Conventions

### 2.1 Base URL & Headers
- **Base URL:** `/api/`
- **Content-Type:** `application/json`
- **Authentication:** Session cookie managed via NextAuth.js (`auth()` helper)
- **CSRF Protection:** SameSite cookies with origin verification on mutating requests (POST, PUT, DELETE, PATCH).

### 2.2 Standard Response Structure
```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}
```

---

## 3. API Endpoints Catalog

### 3.1 Authentication & Admissions
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/admissions` | `POST` | Public | Submit prospective student application. |
| `/api/admissions` | `GET` | Admin | Query incoming applications with status filters. |
| `/api/admissions/[id]` | `PATCH` | Admin | Review, approve, or reject admission application. |

### 3.2 Academics & Continuous Assessment
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/classes` | `GET` | All | Fetch academic classes and arms. |
| `/api/teachers` | `GET, POST` | Admin | List teachers or create new teacher profile. |
| `/api/students` | `GET, POST` | Admin | Query enrolled students or register student. |
| `/api/students/promotions` | `POST` | Admin | Execute terminal class promotions. |
| `/api/timetable` | `GET, POST` | All/Admin | Fetch or publish weekly class timetables. |
| `/api/attendance` | `GET, POST` | Teacher/Admin | Query or save daily class attendance records. |
| `/api/assignments` | `GET, POST` | Teacher/Student| List or create homework assignments. |
| `/api/assignments/[id]/submissions`| `GET, POST` | Teacher/Student| Submit homework or view class submissions. |
| `/api/grades` | `GET, POST` | Teacher/Admin | Save continuous assessment marks and feedback. |
| `/api/results` | `GET, POST` | Admin/Teacher/Parent | Compute broadsheet, publish results, or fetch report card. |

### 3.3 Bursary & Financial Clearances
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/fees` | `GET, POST` | Admin/Parent | Fetch student invoices or generate billing. |
| `/api/fees/[id]/upload-receipt` | `POST` | Parent | Upload bank transfer proof receipt for bursar approval. |
| `/api/fees/approvals` | `GET, POST` | Bursar/Admin | View pending receipt queue; approve or reject receipts. |
| `/api/payments/paystack/initialize` | `POST` | Parent | Initialize automated Paystack checkout. |
| `/api/payments/paystack/verify` | `GET` | Parent/Bursar | Verify transaction reference with Paystack. |
| `/api/webhooks/paystack` | `POST` | Public / Paystack | Idempotent HMAC SHA-512 webhook handler. |

### 3.4 Extended Modules (Phase 4)
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/cbt/exams` | `GET, POST` | Admin/Teacher | Create or list timed CBT examinations. |
| `/api/cbt/exams/[id]` | `GET` | Student/Teacher | Retrieve CBT exam questions (answers hidden for students). |
| `/api/cbt/attempts` | `POST` | Student | Submit CBT answers; calculate instant score & feedback. |
| `/api/payroll` | `GET, POST` | Bursar/Admin | Run staff monthly payroll (Basic + Allowances - Pension - Tax). |
| `/api/expenses` | `GET, POST` | Bursar/Admin | Log operational disbursements with payment vouchers. |
| `/api/health` | `GET, POST` | Nurse/Admin | Log sick bay clinic encounters and vitals. |
| `/api/inventory` | `GET, POST` | Store/Admin | Manage store stock items and re-order thresholds. |
| `/api/clubs` | `GET, POST` | All | Extracurricular club directory and student enrollment. |
| `/api/examinations/external` | `GET, POST` | Admin | Register candidates for WAEC, NECO, BECE, NCEE exams. |

---

## 4. Sample Request & Response Payloads

### CBT Exam Attempt Submission (`POST /api/cbt/attempts`)
**Request Body:**
```json
{
  "examId": "cbt_1731430000000",
  "answers": {
    "q-1": "B",
    "q-2": "D",
    "q-3": "A"
  },
  "timeSpentSeconds": 540
}
```
**Response Body (201 Created):**
```json
{
  "success": true,
  "message": "CBT exam submitted and scored successfully",
  "data": {
    "attemptId": "att_1731430005000",
    "examTitle": "First Term Mathematics CBT Test",
    "score": 80,
    "totalMarks": 100,
    "percentage": 80,
    "passed": true,
    "timeSpentSeconds": 540
  }
}
```
