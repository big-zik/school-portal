# 📐 Software Design Document (SDD): School Portal

**Document ID:** DOC-SDD-001  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** Software Architecture Team  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Principal Architect | Comprehensive Software Design Document with architectural diagrams | Approved |

---

## 2. System Overview
The School Portal is architected as a modern, decoupled full-stack application built upon **Next.js 14 App Router** using React Server Components (RSC) and server actions alongside type-safe API route handlers. The backend leverages **Prisma ORM** connecting to a high-availability **PostgreSQL** relational database.

### Core Architectural Principles:
1. **Separation of Concerns:** Distinct separation between Presentation (UI/React), Business Logic (Services/APIs), and Persistence (Prisma/PostgreSQL).
2. **Defensive Security & RBAC:** Session cookies encrypted at rest, route middleware protection, and API-level role checks.
3. **Resilience & Fault Tolerance:** Automatic fallback mocks for third-party services (e.g. Paystack test sandbox) to prevent application crashes during external API downtime.
4. **Offline Capability & PWA:** Mobile-first service worker registration and manifest enabling standalone home-screen launch on smartphones.

---

## 3. Architecture Diagrams

### 3.1 High-Level Multi-Tier System Architecture

```mermaid
graph TD
    subgraph Client Layer
        Web[Desktop Browser - React 18]
        Mobile[Mobile Browser & PWA - Service Worker]
    end

    subgraph Edge & Routing Layer
        Proxy[Reverse Proxy / Nginx / Vercel Edge]
        AuthGuard[Next.js Auth Middleware - RBAC]
    end

    subgraph Application Layer - Next.js 14
        RSC[React Server Components - SSR]
        APIRoutes[REST API Route Handlers /api/*]
        PayEngine[Payment Processing Service]
        AuditService[Audit Logging Engine]
        CBTService[CBT Auto-Grader & Timer]
    end

    subgraph Data & Integration Layer
        PrismaClient[Prisma ORM Client]
        Postgres[(PostgreSQL Relational DB)]
        PaystackAPI[(Paystack Gateway API)]
        FileStore[Secure Local / Object Storage]
    end

    Client Layer --> Proxy
    Proxy --> AuthGuard
    AuthGuard --> RSC
    AuthGuard --> APIRoutes
    APIRoutes --> PayEngine
    APIRoutes --> AuditService
    APIRoutes --> CBTService
    APIRoutes --> PrismaClient
    RSC --> PrismaClient
    PrismaClient --> Postgres
    PayEngine <--> PaystackAPI
    APIRoutes --> FileStore
```

### 3.2 Frontend Architecture
- **Framework:** Next.js 14 with TypeScript (`strict: true`).
- **Styling & Components:** Tailwind CSS with utility-first responsive styling and Lucide React icons.
- **State Management:** React hooks (`useState`, `useEffect`, `useMemo`) combined with Server Actions and URL query parameter state for filters and pagination.
- **Rendering Strategy:** Server-Side Rendering (SSR) for static dashboards and data grids; Client Components (`'use client'`) for interactive widgets, timers, and modal dialogs.

### 3.3 Backend & API Architecture
- **Protocol:** HTTP/1.1 and HTTP/2 over TLS 1.3.
- **Data Serialization:** Standardized JSON with typed `ApiResponse<T>` envelope:
  ```json
  {
    "success": true,
    "data": {},
    "message": "Operation successful",
    "meta": { "total": 100, "page": 1, "limit": 20 }
  }
  ```
- **Error Format:**
  ```json
  {
    "success": false,
    "error": "Descriptive error message",
    "statusCode": 400
  }
  ```

---

## 4. Third-Party Integrations Architecture
1. **Paystack Payment Gateway:**
   - Outbound REST calls for transaction initialization (`https://api.paystack.co/transaction/initialize`).
   - Inbound webhook receiver (`/api/webhooks/paystack`) validated using `x-paystack-signature` HMAC SHA-512 digest.
2. **File Storage Subsystem:**
   - Handled via dedicated `/api/upload` endpoint writing to disk or cloud object storage with file mime-type whitelisting and UUID file renaming.

---

## 5. Deployment & Infrastructure Architecture
- **Containerization:** Multi-stage Docker container build packaging Node.js runtime and compiled Next.js standalone assets.
- **Database Engine:** PostgreSQL 15+ with connection pooling enabled.
- **Reverse Proxy:** Nginx configured with gzip/brotli compression, HTTP/2 termination, and rate-limiting headers.
