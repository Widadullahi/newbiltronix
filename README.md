# Biltronix Sales Monorepo

This repository is now an npm workspace monorepo.

## Packages
- `biltronix-react`: Vite + React frontend.
- `biltronix-api`: Express API backed by AWS DynamoDB.

## Common Commands
```sh
npm install
npm run dev:api
npm run dev:web
npm run build
```

## AWS
- DynamoDB tables are defined in `infra/dynamodb.yaml`.
- The API reads AWS configuration from `AWS_REGION`, `DYNAMODB_TABLE_PREFIX`, and optional per-table overrides.
- The frontend reads the API URL from `VITE_API_BASE_URL`.
