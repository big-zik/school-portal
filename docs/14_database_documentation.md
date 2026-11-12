# 🗃️ Database Setup, Migration & Operations Guide: School Portal

**Document ID:** DOC-DEV-002  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** Database Administration (DBA) Team  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Lead DBA | Comprehensive database operations, seed guide, and backup procedures | Approved |

---

## 2. Database Environment Setup

### 2.1 Prerequisites
- PostgreSQL 15 or 16 installed locally or running via Docker container.
- Node.js v20+ and npm installed.

### 2.2 Connection String Configuration
Set the `DATABASE_URL` environment variable in `.env`:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/school_portal?schema=public"
```

---

## 3. Database Migration Procedures

### 3.1 Generating & Applying Migrations
To generate and execute Prisma migrations against the target database:
```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name init_school_portal

# Push schema directly in development environments
npx prisma db push
```

### 3.2 Seeding the Database
The project includes a comprehensive seed script in `prisma/seed.ts` populating:
- Default school tenant: *St. Augustine International Academy*
- Current Academic Year (2025/2026) and 1st Term
- System Roles: `SUPER_ADMIN`, `ADMIN`, `TEACHER`, `STUDENT`, `PARENT`, `ACCOUNTANT`, `LIBRARIAN`
- Demo Users with hashed passwords (`Password123!`):
  - Super Admin: `superadmin@school.com`
  - School Admin: `admin@school.com`
  - Form Teacher: `teacher.adeyemi@school.com`
  - Student: `student.chidiebere@school.com`
  - Parent: `parent.johnson@school.com`
  - Bursar / Accountant: `accountant@school.com`
  - Librarian: `librarian@school.com`
- Class arms: JSS 1A, JSS 2A, SS 1 Science, SS 2 Commercial, SS 3 Arts
- Subjects: English, Mathematics, Biology, Physics, Chemistry, Economics
- Attendance records, homework assignments, continuous assessment scores
- Fee categories, invoices, and library catalog books

**To run the seed script:**
```bash
npm run seed
```

---

## 4. Database Backup & Disaster Recovery Procedures

### 4.1 Automated Daily Backup Script
Execute daily PostgreSQL dumps using `pg_dump`:
```bash
# Automated daily compressed backup
pg_dump -U postgres -h localhost -d school_portal -F c -b -v -f "/backups/school_portal_$(date +%Y%m%d_%H%M%S).dump"
```

### 4.2 Database Restoration Procedure
In the event of database corruption or hardware failure:
```bash
# 1. Terminate active database connections
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'school_portal';"

# 2. Drop existing corrupted database and recreate
dropdb -U postgres school_portal
createdb -U postgres school_portal

# 3. Restore from verified snapshot file
pg_restore -U postgres -d school_portal -v "/backups/school_portal_latest.dump"
```
