# 📖 Source Code & Developer Setup Guide: School Portal

**Document ID:** DOC-DEV-003  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** Software Engineering Team  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | DevOps & Tooling Lead | Developer onboarding, local setup, build instructions | Approved |

---

## 2. Quick-Start Local Development Setup

### 2.1 Clone the Repository
```bash
git clone https://github.com/big-zik/school-portal.git
cd school-portal
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Environment Configuration
Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```
Key variables:
- `DATABASE_URL`: PostgreSQL connection string.
- `NEXTAUTH_SECRET`: Secret key for JWT session encryption (`openssl rand -base64 32`).
- `NEXTAUTH_URL`: `http://localhost:3000`
- `PAYSTACK_SECRET_KEY`: `sk_test_...` (Paystack sandbox or live API key).
- `PAYSTACK_PUBLIC_KEY`: `pk_test_...`

### 2.4 Initialize Database & Seed Demo Data
```bash
npx prisma generate
npx prisma db push
npm run seed
```

### 2.5 Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Running Automated Tests & Type Checks

### 3.1 Static Type Checking
```bash
npx tsc --noEmit
```

### 3.2 Automated Jest Test Suite Execution
```bash
npm test
```
To run tests with code coverage analysis:
```bash
npm test -- --coverage
```

### 3.3 Building for Production
```bash
npm run build
npm start
```
