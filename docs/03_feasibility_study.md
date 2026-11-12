# 🔬 Feasibility Study: School Portal

**Document ID:** DOC-PROJ-003  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** Technical Architecture & Systems Engineering  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Principal Systems Analyst | Initial comprehensive feasibility assessment | Approved |

---

## 2. Executive Summary
This feasibility study investigates the viability of engineering, deploying, and maintaining the School Portal web application. The evaluation analyzes technical, operational, economic, legal, and risk dimensions to validate whether the chosen architecture effectively meets institutional requirements.

---

## 3. Technical Feasibility

### 3.1 Architecture & Stack Evaluation
- **Framework (Next.js 14 App Router):** Provides server-side rendering (SSR) for fast initial loads, client-side interactivity for live CBT exams and dynamic forms, and React Server Components (RSC) to reduce client JavaScript bundle size.
- **ORM & Data Layer (Prisma + PostgreSQL):** Prisma provides type-safe query generation, automated migrations, and schema modeling covering 61 interconnected educational models. PostgreSQL guarantees ACID compliance for financial ledgers and academic grading records.
- **Authentication & Authorization (NextAuth.js v5):** Implements secure JWT/database session strategies, bcrypt salt hashing, and granular Role-Based Access Control (RBAC) across 8 user roles.
- **Payment Processing (Paystack API & Webhooks):** Standardized REST integration with HMAC SHA-512 webhook signature verification for automated Naira payment settlements.

### 3.2 Infrastructure & Hardware Requirements
- **Server:** Linux Ubuntu 22.04 LTS / Alpine Docker containers with 2 vCPUs and 4GB RAM minimum for baseline deployment (scaling horizontally during peak examination windows).
- **Client Footprint:** Runs seamlessly in standard mobile and desktop browsers (Chrome, Safari, Firefox, Edge) without requiring native app store installations.

---

## 4. Operational Feasibility
- **User Adoption:** Intuitive role-tailored dashboards ensure non-technical users (parents and students) navigate without formal training.
- **Administrative Burden Reduction:** Eliminates 3–4 weeks of manual report card collation and grading calculations each academic term.
- **Continuity of Operations:** The system incorporates a PWA manifest and caching mechanisms allowing student test sessions to withstand intermittent campus network drops.

---

## 5. Economic & Cost Feasibility

| Item | Estimated Annual Cost (Self-Hosted / Cloud) | Estimated Cost (Commercial SaaS Alternatives) | Net Savings |
|---|---|---|---|
| **Server Compute & Container Hosting** | \$120 – \$300 / year | \$2,400 / year | **\$2,100 / year** |
| **Managed PostgreSQL Database** | \$180 – \$360 / year | Included in SaaS fees | – |
| **Payment Gateway Transaction Fees** | 1.5% + NGN 100 (Capped at NGN 2,000 per tx) | 2.5% + fixed licensing | Substantial |
| **SMS & Notification Gateway** | Pay-as-you-go per volume | High markup in third-party SMS | **40% savings** |
| **Total Five-Year TCO** | **~\$2,500 – \$4,000** | **~\$15,000 – \$25,000** | **> 75% TCO Savings** |

---

## 6. Legal, Compliance & Data Privacy Considerations
- **Nigeria Data Protection Act (NDPA 2023) & GDPR Alignment:**
  - Strict privacy protections for minor student data and academic records.
  - Role-based isolation preventing parents from inspecting non-ward academic records.
  - Audit logging of all critical record mutations (grades, admissions, payroll runs, disbursements).
  - Passwords hashed using one-way cryptographic algorithms (`bcrypt`); plain passwords never stored.

---

## 7. Alternative Solutions Considered

| Alternative Solution | Advantages | Disadvantages | Decision |
|---|---|---|---|
| **Commercial Off-The-Shelf (COTS) SaaS (e.g. Edves, SAFSMS)** | Immediate turnkey deployment | Recurring monthly licensing costs, inflexible customization for custom grading scales, external vendor lock-in. | **Rejected** |
| **Traditional PHP / Laravel Monolith** | Mature ecosystem, abundant local PHP hosting | Less reactive single-page app experience for CBT and real-time score calculation compared to React/Next.js. | **Rejected** |
| **Next.js 14 + Prisma + PostgreSQL (Chosen Solution)** | Full source code ownership, zero license fees, modern responsive UI, built-in PWA capabilities, type-safe full-stack TypeScript. | Requires competent in-house or contracted engineering team. | **Approved & Implemented** |

---

## 8. Final Recommendation
The technical, operational, and financial analyses demonstrate that the School Portal is **highly feasible and optimal**. Full implementation has proceeded accordingly.
