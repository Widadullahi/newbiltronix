# Biltronix Automotive (React Frontend)

This frontend now uses the Biltronix MySQL API backend (not Sanity).

## Frontend setup
1. Copy `.env.example` to `.env`.
2. Set:
- `VITE_API_BASE_URL` (default: `http://localhost:4000/api`)

## Run
- `npm install`
- `npm run dev`

## Backend required
Start the API in `../biltronix-api` first.

## Data integration
- API client: `src/lib/sanityClient.js` (kept filename for compatibility)
- Admin dashboard: `src/pages/AdminDashboardPage.jsx`
- Landing/store/tips/booking integration: `src/components/StaticHtmlPage.jsx`
- Inspection app: `src/pages/InspectionPortalPage.jsx`
