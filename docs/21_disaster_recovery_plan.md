# 🚨 Disaster Recovery & Business Continuity Plan: School Portal

**Document ID:** DOC-OPS-003  
**Version:** 1.0.0  
**Date:** November 12, 2026  
**Status:** Approved  
**Author:** Infrastructure Resilience Team  

---

## 1. Document Control

| Version | Date | Author | Description / Change History | Status |
|---|---|---|---|---|
| 1.0.0 | 2026-11-12 | Disaster Recovery Lead | Disaster recovery protocols, RTO/RPO targets, and failover runbooks | Approved |

---

## 2. Recovery Objectives
- **Recovery Time Objective (RTO):** $\le 2$ hours (Maximum acceptable downtime from catastrophic failure to full service restoration).
- **Recovery Point Objective (RPO):** $\le 1$ hour (Maximum acceptable data loss period, achieved via automated snapshots and continuous transaction logs).

---

## 3. Failure Scenarios & Recovery Runbooks

### 3.1 Scenario 1: Primary Database Server Hardware Failure
1. **Detection:** Uptime monitor flags database connection timeout; error logs register `ECONNREFUSED`.
2. **Action:**
   - Provision standby PostgreSQL instance on backup cloud region or local server.
   - Fetch latest encrypted backup dump from remote storage (`/backups/`).
   - Run `pg_restore -U postgres -d school_portal -v latest.dump`.
   - Update `DATABASE_URL` in application environment and restart Docker containers:
     ```bash
     docker compose restart app
     ```
3. **Verification:** Query user table and verify latest admission and payment timestamps.

### 3.2 Scenario 2: Bad Code Deployment or Database Migration Corruption
1. **Detection:** Application fails post-deployment verification tests or returns HTTP 500 across core routes.
2. **Action:**
   - Execute immediate container rollback to previous Docker image tag:
     ```bash
     docker compose pull app:previous-stable
     docker compose up -d app
     ```
   - If database schema was modified, apply down migration or restore pre-deployment database snapshot.

### 3.3 Scenario 3: Cloud Hosting Provider Regional Outage
1. **Detection:** Cloud provider issues major incident advisory affecting target availability zone.
2. **Action:**
   - Update Cloudflare DNS record to point traffic to secondary failover server.
   - Launch application stack from GitHub repository and restore database snapshot.

---

## 4. Emergency Contacts & Chain of Command

| Contact Role | Name | Phone / Emergency Channel | Escalation Order |
|---|---|---|---|
| **Primary DevOps Engineer** | Engr. K. Alabi | +234 803 000 0001 | 1st Call |
| **Lead Software Architect** | Engr. Zik O. | +234 803 000 0002 | 2nd Call |
| **School Systems Administrator**| A. Balogun | +234 803 000 0003 | 3rd Call |
| **Bursary / Finance Lead** | F. Adeyemi | +234 803 000 0004 | 4th Call (Financial Incidents) |
