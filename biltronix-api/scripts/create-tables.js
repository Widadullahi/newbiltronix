import { CreateTableCommand, DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const region = String(process.env.AWS_REGION || 'us-east-1');
const endpoint = String(process.env.DYNAMODB_ENDPOINT || '');
const prefix = String(process.env.DYNAMODB_TABLE_PREFIX || 'biltronix');

const client = new DynamoDBClient({ region, ...(endpoint ? { endpoint } : {}) });

const table = (suffix, attributeDefinitions, keySchema, globalSecondaryIndexes = []) => ({ name: `${prefix}-${suffix}`, attributeDefinitions, keySchema, globalSecondaryIndexes });

const hashKey = (name) => [{ AttributeName: name, KeyType: 'HASH' }];

const tables = [
  table('bookings', [{ AttributeName: 'id', AttributeType: 'S' }], hashKey('id')),
  table('orders', [{ AttributeName: 'id', AttributeType: 'S' }], hashKey('id')),
  table('stock-items', [{ AttributeName: 'id', AttributeType: 'S' }], hashKey('id')),
  table('car-tips', [{ AttributeName: 'id', AttributeType: 'S' }], hashKey('id')),
  table('store-highlights', [{ AttributeName: 'id', AttributeType: 'S' }], hashKey('id')),
  table('inspector-accounts', [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'email', AttributeType: 'S' },
  ], hashKey('id'), [{ IndexName: 'email-index', KeySchema: hashKey('email'), Projection: { ProjectionType: 'ALL' } }]),
  table('inspection-reports', [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'accountId', AttributeType: 'S' },
  ], hashKey('id'), [{ IndexName: 'accountId-index', KeySchema: hashKey('accountId'), Projection: { ProjectionType: 'ALL' } }]),
  table('refresh-tokens', [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'tokenHash', AttributeType: 'S' },
    { AttributeName: 'subjectId', AttributeType: 'S' },
  ], hashKey('id'), [
    { IndexName: 'tokenHash-index', KeySchema: hashKey('tokenHash'), Projection: { ProjectionType: 'ALL' } },
    { IndexName: 'subjectId-index', KeySchema: hashKey('subjectId'), Projection: { ProjectionType: 'ALL' } },
  ]),
  table('password-reset-otps', [{ AttributeName: 'id', AttributeType: 'S' }], hashKey('id')),
];

async function waitForDynamo(timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await client.send(new ListTablesCommand({}));
      return;
    } catch (error) {
      console.log(`waiting for DynamoDB at ${endpoint || 'AWS'}…`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error('DynamoDB did not become reachable in time.');
}

async function createTables() {
  process.stdout.write(`using prefix "${prefix}" against ${endpoint || 'AWS default'}\n`);
  await waitForDynamo();

  const { TableNames: existingNames = [] } = await client.send(new ListTablesCommand({}));
  const existing = new Set(existingNames);

  for (const def of tables) {
    if (existing.has(def.name)) {
      console.log(`exists: ${def.name}`);
      continue;
    }

    await client.send(new CreateTableCommand({
      TableName: def.name,
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: def.attributeDefinitions,
      KeySchema: def.keySchema,
      ...(def.globalSecondaryIndexes?.length ? { GlobalSecondaryIndexes: def.globalSecondaryIndexes } : {}),
    }));
    console.log(`created: ${def.name}`);
  }

  console.log('All tables are ready.');
}

createTables().catch((error) => {
  console.error(error);
  process.exit(1);
});