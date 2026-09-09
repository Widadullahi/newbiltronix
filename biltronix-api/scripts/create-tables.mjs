import {
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb';

const endpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';
const region = 'us-east-1';

const client = new DynamoDBClient({
  region,
  endpoint,
  credentials: { accessKeyId: 'dummy', secretAccessKey: 'dummy' },
});

const base = (name, gsis = []) => ({
  TableName: name,
  BillingMode: 'PAY_PER_REQUEST',
  KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    ...gsis.flatMap(([key]) => [{ AttributeName: key, AttributeType: 'S' }]),
  ],
  ...(gsis.length
    ? {
        GlobalSecondaryIndexes: gsis.map(([key, indexName]) => ({
          IndexName: indexName,
          KeySchema: [{ AttributeName: key, KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
        })),
      }
    : {}),
});

const prefix = process.env.DYNAMODB_TABLE_PREFIX || 'biltronix';
const tables = [
  base(`${prefix}-bookings`),
  base(`${prefix}-orders`),
  base(`${prefix}-stock-items`),
  base(`${prefix}-car-tips`),
  base(`${prefix}-store-highlights`),
  base(`${prefix}-inspector-accounts`, [['email', 'email-index']]),
  base(`${prefix}-refresh-tokens`, [
    ['tokenHash', 'tokenHash-index'],
    ['subjectId', 'subjectId-index'],
  ]),
  base(`${prefix}-password-reset-otps`),
];

const existing = await client.send(new ListTablesCommand({}));
const names = new Set(existing.TableNames || []);

for (const def of tables) {
  if (names.has(def.TableName)) {
    console.log(`Exists: ${def.TableName}`);
    continue;
  }
  await client.send(new CreateTableCommand(def));
  console.log(`Created: ${def.TableName}`);
}
