# 🚀 School Portal Production Deployment Guide

This guide covers production deployment of the School Portal using Docker, PostgreSQL, Redis, and Cloud hosting (AWS, DigitalOcean, GCP, or bare metal).

---

## 1. System Architecture

```
                    Internet
                       │
                 [Cloudflare CDN]
                       │ (HTTPS 443)
                 [Nginx / Caddy]
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   [Next.js App Instance 1]  [Next.js App Instance 2]
          │                         │
          ├─────────────────────────┤
          ▼                         ▼
   [PostgreSQL 16]             [Redis 7]
   (Relational DB)             (Cache & BullMQ)
          │
     [AWS S3 / R2]
   (Encrypted Storage)
```

---

## 2. Docker & Container Deployment

### `Dockerfile`
The multi-stage build creates a lean, secure container:

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 3. `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://school_user:${DB_PASSWORD}@db:5432/school_portal?schema=public
      - REDIS_URL=redis://redis:6379
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXTAUTH_URL=https://portal.staugustine.edu
      - STORAGE_PROVIDER=s3
      - AWS_S3_BUCKET=${S3_BUCKET}
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: school_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: school_portal
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

---

## 4. Database Migrations & Initial Seeding

```bash
# 1. Run migrations
npx prisma migrate deploy

# 2. Seed realistic demo data
npm run seed
```

---

## 5. Automated Backup & Disaster Recovery

Setup a daily cron job on the database server to backup to encrypted S3 storage:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/school_portal"
FILENAME="db_backup_${TIMESTAMP}.sql.gz"

pg_dump -U school_user school_portal | gzip > "${BACKUP_DIR}/${FILENAME}"
aws s3 cp "${BACKUP_DIR}/${FILENAME}" "s3://school-db-backups/${FILENAME}" --sse AES256
find "${BACKUP_DIR}" -type f -mtime +14 -name "*.sql.gz" -exec rm {} \;
```
