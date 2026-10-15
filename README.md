# FCMS — Gym Management System

A web dashboard for running a gym: members, memberships, payments (IDR), front-desk check-in, classes, trainers and staff accounts.

- **Frontend:** React + Vite + Tailwind (`FrontEnd/`), deployed on Vercel
- **Backend:** Node.js + Express + Prisma (`BackEnd/`), deployed on Google Cloud Run
- **Database:** PostgreSQL (Neon)

## Features

| Area | What it does |
| --- | --- |
| Login & roles | Email/password sign-in. The first account becomes **Owner**; later sign-ups are **Staff** and must be approved. Owner can promote staff to **Admin**. |
| Check-in | Front desk searches a member and checks them in. Expired, frozen or inactive memberships are refused, and double check-ins are ignored. |
| Members | Search, filter by membership status, profile with membership/payment/visit history, CSV export. |
| Subscriptions | End date calculated from the plan; payment can be recorded in the same step; cancel or renew. Status (Active / Expiring / Expired) is always computed from dates. |
| Payments | Rupiah amounts, Cash / QRIS / cards / transfer / e-wallet, monthly filter and totals, CSV export. |
| Classes & trainers | Assign trainers to classes; attendance respects class capacity and blocks duplicates. |
| Dashboard | Active members, today's check-ins, monthly revenue vs last month, 6-month revenue chart, 14-day visit chart, memberships expiring this week. |

### Permissions

| Action | Staff | Admin | Owner |
| --- | :-: | :-: | :-: |
| Check-in, add/edit members, sell subscriptions, record payments & attendance | ✓ | ✓ | ✓ |
| Manage plans/prices, trainers, classes; delete records | | ✓ | ✓ |
| Approve/disable staff accounts | | ✓ | ✓ |
| Create or manage admins | | | ✓ |

All API routes except `/auth/login`, `/auth/register` and `/health` require a valid login token.

## Local development

```bash
# 1. Database (any Postgres works; this uses Docker)
docker run -d --name fcms-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=fcms -p 55432:5432 postgres:16-alpine

# 2. Backend
cd BackEnd
cp .env.example .env    # set DATABASE_URL=postgresql://postgres:dev@localhost:55432/fcms
npm install
npm run migrate
npm run seed            # optional demo data (only runs on an empty database)
npm run dev             # http://localhost:8080

# 3. Frontend (new terminal)
cd FrontEnd
npm install
VITE_API_URL=http://localhost:8080 npx vite --port 5173
```

Open http://localhost:5173 and register — the first account becomes the owner.

## Configuration

**Backend** (`BackEnd/.env`, or Cloud Run environment variables):

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `JWT_SECRET` | yes in production | Long random string for signing logins. The server refuses to start in production without it. |
| `JWT_EXPIRES_IN` | no | Login lifetime, default `7d` |
| `CORS_ORIGINS` | recommended | Comma-separated allowed frontend URLs, e.g. `https://fcms-b958.vercel.app` |

**Frontend** (Vercel project environment variables):

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend URL |
| `VITE_GYM_NAME` | Gym name shown in the sidebar and login screen (brand it per client) |

## Deploying an update

1. **Back up the database** (Neon: create a branch or snapshot).
2. Apply migrations to production from your machine:
   ```bash
   cd BackEnd
   DATABASE_URL="<production url>" npm run migrate
   ```
3. Set `JWT_SECRET` (and `CORS_ORIGINS`) on the Cloud Run service, then deploy the backend.
4. Push to deploy the frontend on Vercel.
5. Immediately open the app and **register your own account** — the first registration becomes the owner.

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
