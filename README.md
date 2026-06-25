# JobRadar

Public job browser for [jobradar.tech](https://jobradar.tech). Pick your filters, browse fresh roles from verified boards, and apply early.

Backend API: [jobradar-server](https://github.com/zsevic/jobradar-server) (NestJS).

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page with latest jobs preview |
| `/dashboard` | Filterable job feed (role, stack, seniority, location) |

Filters are saved in `localStorage` (`jobradar_browse_filters`). Returning visitors with saved filters are redirected from `/` to `/dashboard`.

## Local development

### Prerequisites

- Node.js 20+
- [jobradar-server](https://github.com/zsevic/jobradar-server) running locally (Postgres, Redis, API)

### Setup

```bash
npm install
cp .env.example .env
```

Ensure `NEXT_PUBLIC_API_BASE_URL` points at your backend, e.g. `http://localhost:3002/api`.

### Run

```bash
npm run dev
```

Open http://localhost:3001 (frontend dev server).

In another terminal, start the backend:

```bash
cd ../jobradar-server
docker compose up -d
npm run start:dev
```

Use `PORT=3002` in the backend `.env` to match the default frontend API URL.

### Other commands

```bash
npm run build
npm run start   # production build (default Next.js port 3000 unless configured)
npm run lint
```

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL (required) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 ID; omit to disable |
