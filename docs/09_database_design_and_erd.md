# 🗄️ Database Design & Entity-Relationship Diagram (ERD): School Portal

**Document ID:** DOC-DB-001  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** Database Engineering Team  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Principal Database Architect | Complete database schema design, ERD, and data dictionary | Approved |

---

## 2. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    SCHOOL ||--o{ ACADEMIC_YEAR : has
    ACADEMIC_YEAR ||--o{ TERM : contains
    SCHOOL ||--o{ CLASS : organizes
    CLASS ||--o{ SECTION : divides_into
    CLASS ||--o{ CLASS_SUBJECT : offers
    SUBJECT ||--o{ CLASS_SUBJECT : assigned_to
    
    USER ||--o{ USER_ROLE : holds
    ROLE ||--o{ USER_ROLE : assigned
    USER ||--o{ AUDIT_LOG : generates
    
    USER ||--o| STUDENT : profiles
    USER ||--o| GUARDIAN : profiles
    USER ||--o| TEACHER : profiles
    
    STUDENT }o--o{ GUARDIAN : linked_via_StudentGuardian
    STUDENT ||--o{ ENROLLMENT : enrolls_in
    CLASS ||--o{ ENROLLMENT : contains_students
    
    TEACHER ||--o{ CLASS_SUBJECT : instructs
    CLASS_SUBJECT ||--o{ TIMETABLE : scheduled_in
    
    STUDENT ||--o{ ATTENDANCE : logs
    CLASS ||--o{ ATTENDANCE : records
    
    TEACHER ||--o{ ASSIGNMENT : creates
    ASSIGNMENT ||--o{ SUBMISSION : receives
    STUDENT ||--o{ SUBMISSION : submits
    SUBMISSION ||--o| GRADE : awarded
    
    STUDENT ||--o{ RESULT : obtains
    TERM ||--o{ RESULT : records_for
    
    STUDENT ||--o{ INVOICE : billed_to
    INVOICE ||--o{ INVOICE_ITEM : itemizes
    INVOICE ||--o{ PAYMENT : settles
    PAYMENT ||--o| RECEIPT : generates
    
    BOOK ||--o{ BOOK_LOAN : loaned_via
    STUDENT ||--o{ BOOK_LOAN : borrows
```

---

## 3. Database Normalization & Integrity
The database design adheres strictly to **Third Normal Form (3NF)**:
1. **1NF:** All table attributes are atomic. Multi-valued attributes (such as subjects or Guardian relationships) are isolated into dedicated relational tables (`Subject`, `StudentGuardian`).
2. **2NF:** All non-key attributes are fully functionally dependent on the entire primary key.
3. **3NF:** No transitive functional dependencies exist between non-key attributes.
4. **Currency Handling:** All monetary figures (`amount`, `balance`, `grossPay`, `netPay`, `pension`) are stored as **whole integers representing Kobo** to prevent IEEE 754 floating-point rounding errors.

---

## 4. Key Table Specifications & Data Dictionary

### 4.1 Core Identity & RBAC Tables
- **`User`**: Core login credentials (`id`, `email`, `passwordHash`, `name`, `status`, `createdAt`).
- **`Role`**: System RBAC roles (`SUPER_ADMIN`, `ADMIN`, `TEACHER`, `STUDENT`, `PARENT`, `ACCOUNTANT`, `LIBRARIAN`).
- **`UserRole`**: Junction table mapping users to roles.
- **`AuditLog`**: Immutable event ledger (`userId`, `action`, `module`, `entityType`, `entityId`, `oldValue`, `newValue`, `ipAddress`, `createdAt`).

### 4.2 Academic Setup & Students
- **`Student`**: Academic student record (`id`, `userId`, `admissionNumber`, `currentClassId`, `status`, `gender`, `dateOfBirth`).
- **`Guardian`**: Parent/Guardian record (`id`, `userId`, `relationship`, `phone`, `occupation`, `address`).
- **`StudentGuardian`**: Junction table linking parents to one or more children.
- **`Class` & `Section`**: Class tiers (JSS 1, SS 3) and arms (A, B, C, Gold, Diamond).
- **`Subject` & `ClassSubject`**: Subject catalog and allocation per class arm with assigned teacher.
- **`Attendance`**: Daily attendance entries (`studentId`, `classId`, `date`, `status`, `remarks`).

### 4.3 Assessments, Examinations & Results
- **`Assignment`**: Homework tasks (`title`, `instructions`, `totalMarks`, `dueDate`, `classSubjectId`).
- **`Submission`**: Student homework records (`assignmentId`, `studentId`, `content`, `attachmentUrl`, `submittedAt`, `status`).
- **`Grade`**: Homework scores and teacher feedback remarks.
- **`Result`**: Terminal grades (`studentId`, `classId`, `termId`, `subjectId`, `ca1Score`, `ca2Score`, `examScore`, `totalScore`, `gradeLetter`, `gpa`).

### 4.4 Bursary & Financial Ledgers
- **`Invoice`**: Termly billing (`invoiceNumber`, `studentId`, `termId`, `totalAmountKobo`, `paidAmountKobo`, `status`, `dueDate`).
- **`Payment`**: Payment transactions (`invoiceId`, `amountKobo`, `paymentMethod`, `transactionRef`, `status`, `receiptUrl`, `approvedBy`).
- **`Receipt`**: Official payment receipts (`receiptNumber`, `paymentId`, `issuedAt`).

---

## 5. Soft-Delete & Retention Policies
1. **Audit Logs:** Immutable; retained for a minimum of 7 years to satisfy educational governance standards.
2. **Academic Grades & Results:** Never hard-deleted; modifications create audited superseding records.
3. **Deactivated Users:** Marked with `status: INACTIVE` or `SUSPENDED`; primary keys and relational foreign keys remain intact.
