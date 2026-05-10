# Biltronix API (MySQL)

Express + MySQL backend for:
- Admin login
- Vehicles / car parts / accessories
- Car tips
- Booking requests
- Inspector accounts
- Inspection records

## 1) Create MySQL database
Create a database named `biltronix_db` (or change `DB_NAME` in `.env`).

## 2) Configure env
Copy `.env.example` to `.env` and set:
- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `API_CORS_ORIGINS` (comma-separated allowed frontend origins)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_EXPIRES_IN`
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_SECURE` / `SMTP_FROM` (for password reset OTP email)

## 3) Install and run
- `npm install`
- `npm run dev`

On startup, schema in `sql/schema.sql` is auto-applied.

## Health check
`GET http://localhost:4000/api/health`

## Security included
- Access token + refresh token rotation
- Protected write endpoints (stock items, tips, dashboard, inspector records/settings)
- Helmet security headers
- Rate limiting on login/register endpoints
- Inspector password reset via OTP (email)
