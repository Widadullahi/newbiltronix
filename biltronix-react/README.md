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

## AWS deployment
Build this app and deploy `dist` to S3 + CloudFront or AWS Amplify Hosting.

Set `VITE_API_BASE_URL` to your AWS-hosted API URL, for example:
`https://your-api-id.execute-api.us-east-1.amazonaws.com/api`

## Data integration
- API client: `src/lib/sanityClient.js` (kept filename for compatibility)
- Admin dashboard: `src/pages/AdminDashboardPage.jsx`
- Landing/store/tips/booking integration: `src/components/StaticHtmlPage.jsx`
- Inspection app: `src/pages/InspectionPortalPage.jsx`
