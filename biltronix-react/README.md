# Biltronix Automotive (React Frontend)

This frontend uses the Biltronix API backend.

## Frontend setup
1. Copy `.env.example` to `.env`.
2. Set:
- `VITE_API_BASE_URL` (default: `http://localhost:4000/api`)

## Run
- `npm install`
- `npm run dev`

## Backend required
Start the API in `../biltronix-api` first.

## Vercel deployment
This repo includes a root `vercel.json` configured to build this Vite app from `biltronix-react` and serve `biltronix-react/dist`.

Set `VITE_API_BASE_URL` in Vercel to your Render API URL, for example:
`https://your-render-service.onrender.com/api`

## Data integration
- API client: `src/lib/sanityClient.js` (kept filename for compatibility)
- Admin dashboard: `src/pages/AdminDashboardPage.jsx`
- Landing/store/tips/booking integration: `src/components/StaticHtmlPage.jsx`
- Inspection app: `src/pages/InspectionPortalPage.jsx`
