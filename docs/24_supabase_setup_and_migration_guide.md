# ⚡ Supabase Setup, Configuration & Migration Guide: School Portal

**Document ID:** DOC-SUPA-001  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** Cloud Database & Infrastructure Architecture  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Principal Architect | Complete Supabase connection, storage bucket, and migration guide | Approved |

---

## 2. Overview
This guide provides the exact step-by-step instructions to connect the **School Portal** to **Supabase** as its production-grade managed PostgreSQL database and cloud object storage backend.

Because the School Portal database is built with PostgreSQL and Prisma ORM, **100% of your existing 61 Prisma data models, relations, and seed scripts run directly on Supabase without requiring any schema changes**.

```mermaid
graph TD
    subgraph School Portal Next.js App
        PrismaRuntime[Prisma Client (Runtime Queries)] -->|Pooled Port 6543| Supavisor[Supavisor Connection Pooler]
        PrismaCLI[Prisma CLI (Migrations & db push)] -->|Direct Port 5432| DirectDB[(PostgreSQL Database Instance)]
        StorageClient[Supabase Storage Client] -->|HTTPS REST| SupaBuckets[(Storage: receipts, documents)]
    end

    subgraph Supabase Cloud Infrastructure
        Supavisor --> DirectDB
        DirectDB --> AutoBackup[(Automated Daily Snapshots & PITR)]
        DirectDB --> SupaStudio[Supabase Studio Table Editor Web GUI]
    end
```

---

## 3. Step-by-Step Setup Instructions

### Step 1: Create a Free Project on Supabase
1. Navigate to **[https://supabase.com](https://supabase.com)** and sign in (via GitHub or email).
2. Click **New Project** and select an Organization.
3. Enter Project details:
   - **Name:** `school-portal`
   - **Database Password:** Choose a strong password (save this securely).
   - **Region:** Select the region closest to your users (e.g., `EU West / London` or `EU Central / Frankfurt` for low latency to West Africa).
4. Click **Create new project** and wait 1–2 minutes for the database provisioning to complete.

---

### Step 2: Retrieve Your Database Connection Strings
1. In your Supabase dashboard, click the **Settings (Gear icon)** in the left sidebar $\rightarrow$ **Database**.
2. Scroll to the **Connection string** section and select the **URI** tab:
3. **Copy the Pooled Connection String (Transaction mode):**
   - Mode: `Transaction` (Port `6543`)
   - It will look like:
     ```
     postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
4. **Copy the Direct Connection String (Session mode):**
   - Mode: `Session` (Port `5432`)
   - It will look like:
     ```
     postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
     ```

---

### Step 3: Retrieve Your Supabase API Keys & URL
1. In the Supabase sidebar, go to **Settings** $\rightarrow$ **API**.
2. Copy the following credentials:
   - **Project URL:** `https://[YOUR-PROJECT-REF].supabase.co`
   - **`anon` `public` key:** (Used for public browser interactions)
   - **`service_role` `secret` key:** (Used by server actions and backend storage uploads; **keep secret!**)

---

### Step 4: Configure Your Environment Variables (`.env`)
Update your local or production `.env` file with your credentials:

```bash
# -----------------------------------------------------------------------------
# DATABASE: SUPABASE MANAGED POSTGRESQL
# -----------------------------------------------------------------------------
# Transaction Pooled URL (used by Prisma Client runtime queries)
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection URL (used by Prisma CLI for migrations and schema pushes)
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# -----------------------------------------------------------------------------
# SUPABASE API & CLOUD OBJECT STORAGE
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Storage provider switch: 'supabase' (Cloud Storage) or 'local'
STORAGE_PROVIDER="supabase"
SUPABASE_STORAGE_BUCKET_RECEIPTS="receipts"
SUPABASE_STORAGE_BUCKET_DOCS="documents"
```

---

### Step 5: Push Database Schema to Supabase
Run the following commands in your terminal:

```bash
# 1. Regenerate Prisma Client
npx prisma generate

# 2. Push all 61 database models to Supabase
npx prisma db push
```

*Expected Terminal Output:*
```
🚀  Your database is now in sync with your Prisma schema. Done in 3.42s
```

---

### Step 6: Seed Your Supabase Database
Populate your cloud Supabase database with default academic sessions, roles, classes, subjects, demo users, and invoices:

```bash
npm run seed
```

*Expected Terminal Output:*
```
🌱 Seeding database...
  Default school created: St. Augustine International Academy
  Current Academic Year: 2025/2026 (1st Term)
  ✅ 7 system roles created
  👨‍💼 Admin: admin@school.com
  👨‍🏫 Teacher: teacher.adeyemi@school.com
  👨‍🎓 Student: student.chidiebere@school.com
  👨‍👧 Parent: parent.johnson@school.com
  💰 Accountant: accountant@school.com
  📚 Librarian: librarian@school.com
🎉 Seeding completed successfully!
```

---

### Step 7: Create Supabase Storage Buckets
1. In the Supabase sidebar, click **Storage**.
2. Click **New Bucket**:
   - **Bucket 1: `receipts`**
     - Name: `receipts`
     - Public bucket: **OFF** (Keep Private — contains sensitive bank teller slips).
     - Click **Save**.
   - **Bucket 2: `documents`**
     - Name: `documents`
     - Public bucket: **ON** (Public — contains school policies, circulars, homework guides).
     - Click **Save**.

---

## 4. Verifying Your Supabase Integration
1. Open the **Table Editor** in your Supabase dashboard. You will see all 61 tables populated (`User`, `Student`, `Guardian`, `Class`, `Subject`, `Invoice`, `Payment`, `Attendance`, `Assignment`, `AuditLog`, etc.).
2. Run your local or staging server:
   ```bash
   npm run dev
   ```
3. Log in with `admin@school.com` (`Password123!`) or `parent.johnson@school.com` (`Password123!`).
4. Perform an action (e.g. approve an admission, mark attendance, or upload a bank receipt) and verify that the data appears instantly in your Supabase Table Editor!

---

## 5. Troubleshooting & Best Practices

| Common Issue | Cause | Solution |
|---|---|---|
| `Prepared statement already exists` or `Connection terminated` | Prisma attempting prepared statements through pgbouncer in transaction mode. | Ensure `?pgbouncer=true` is appended to `DATABASE_URL` and that `DIRECT_URL` (port 5432) is configured in `prisma/schema.prisma`. |
| `P1001: Can't reach database server` | Special characters in password not URL-encoded, or network firewall. | URL-encode special characters in password (e.g. `@` becomes `%40`, `#` becomes `%23`). |
| Storage upload returns 403 Forbidden | Missing or invalid `SUPABASE_SERVICE_ROLE_KEY`. | Copy the `service_role` secret key (not the anon key) into your environment variables. |
