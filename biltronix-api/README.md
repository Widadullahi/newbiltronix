# Biltronix API

Express + DynamoDB backend for:
- Admin login
- Vehicles / car parts / accessories
- Car tips
- Booking requests
- Inspector accounts
- Inspection records

## 1) Configure env
Copy `.env.example` to `.env` and set:
- `PORT`
- `API_CORS_ORIGINS` (comma-separated allowed frontend origins)
- `AWS_REGION`
- `DYNAMODB_TABLE_PREFIX`
- `DYNAMODB_ENDPOINT` (optional, for DynamoDB Local)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_EXPIRES_IN`
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_SECURE` / `SMTP_FROM` (for password reset OTP email)

## 2) Install and run
- `npm install`
- `npm run dev`

On startup, default store highlights are seeded if the DynamoDB store highlights table is empty.

## DynamoDB
Create the tables with the root CloudFormation template:

```sh
aws cloudformation deploy \
  --stack-name biltronix-dynamodb \
  --template-file infra/dynamodb.yaml \
  --parameter-overrides TablePrefix=biltronix
```

The API expects table names like `biltronix-bookings`, `biltronix-stock-items`, and `biltronix-inspection-reports` unless overridden with the `DYNAMODB_*_TABLE` variables.

## AWS deployment
The app is now structured for AWS deployment:
- Frontend: deploy `biltronix-react` to S3 + CloudFront or AWS Amplify Hosting.
- API: deploy `biltronix-api` to App Runner, Elastic Beanstalk, ECS, or Lambda behind API Gateway.
- Database: DynamoDB tables from `infra/dynamodb.yaml`.

## Health check
`GET http://localhost:4000/api/health`

## Security included
- Access token + refresh token rotation
- Protected write endpoints (stock items, tips, dashboard, inspector records/settings)
- Helmet security headers
- Rate limiting on login/register endpoints
- Inspector password reset via OTP (email)
