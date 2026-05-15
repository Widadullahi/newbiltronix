# Biltronix API

Express + SQLite backend for:
- Admin login
- Vehicles / car parts / accessories
- Car tips
- Booking requests
- Inspector accounts
- Inspection records

## 1) Configure env
Copy `.env.example` to `.env` and set:
- `PORT`
- `SQLITE_DB_PATH` (optional locally)
- `API_CORS_ORIGINS` (comma-separated allowed frontend origins)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_EXPIRES_IN`
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_SECURE` / `SMTP_FROM` (for password reset OTP email)

## 2) Install and run
- `npm install`
- `npm run dev`

On startup, the SQLite schema is created automatically.

## Render deployment
This repo includes a root `render.yaml` configured to deploy only this API service from `biltronix-api`.

## Health check
`GET http://localhost:4000/api/health`

## Security included
- Access token + refresh token rotation
- Protected write endpoints (stock items, tips, dashboard, inspector records/settings)
- Helmet security headers
- Rate limiting on login/register endpoints
- Inspector password reset via OTP (email)
