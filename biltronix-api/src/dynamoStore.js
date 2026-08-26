import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
const endpoint = process.env.DYNAMODB_ENDPOINT || undefined;
const tablePrefix = process.env.DYNAMODB_TABLE_PREFIX || 'biltronix';

const client = new DynamoDBClient({
  region,
  ...(endpoint ? { endpoint } : {}),
});

export const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
});

export const tables = {
  bookings: process.env.DYNAMODB_BOOKINGS_TABLE || `${tablePrefix}-bookings`,
  orders: process.env.DYNAMODB_ORDERS_TABLE || `${tablePrefix}-orders`,
  stockItems: process.env.DYNAMODB_STOCK_ITEMS_TABLE || `${tablePrefix}-stock-items`,
  carTips: process.env.DYNAMODB_CAR_TIPS_TABLE || `${tablePrefix}-car-tips`,
  storeHighlights: process.env.DYNAMODB_STORE_HIGHLIGHTS_TABLE || `${tablePrefix}-store-highlights`,
  inspectorAccounts: process.env.DYNAMODB_INSPECTOR_ACCOUNTS_TABLE || `${tablePrefix}-inspector-accounts`,
  refreshTokens: process.env.DYNAMODB_REFRESH_TOKENS_TABLE || `${tablePrefix}-refresh-tokens`,
  passwordResetOtps: process.env.DYNAMODB_PASSWORD_RESET_OTPS_TABLE || `${tablePrefix}-password-reset-otps`,
};

export const nowIso = () => new Date().toISOString();
export const makeId = () => randomUUID();

export async function listItems(tableName, { limit = 500, filterExpression, expressionAttributeNames, expressionAttributeValues } = {}) {
  const items = [];
  let ExclusiveStartKey;

  do {
    const page = await dynamo.send(new ScanCommand({
      TableName: tableName,
      Limit: Math.min(Math.max(limit - items.length, 1), 500),
      ExclusiveStartKey,
      FilterExpression: filterExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    }));

    items.push(...(page.Items || []));
    ExclusiveStartKey = page.LastEvaluatedKey;
  } while (ExclusiveStartKey && items.length < limit);

  return items;
}

export async function queryItems(tableName, indexName, keyConditionExpression, expressionAttributeValues, expressionAttributeNames = undefined, limit = 500) {
  const result = await dynamo.send(new QueryCommand({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    Limit: limit,
  }));

  return result.Items || [];
}

export async function getItem(tableName, id) {
  const result = await dynamo.send(new GetCommand({
    TableName: tableName,
    Key: { id: String(id) },
  }));
  return result.Item || null;
}

export async function putItem(tableName, item) {
  const createdAt = item.createdAt || nowIso();
  const next = {
    ...item,
    id: String(item.id || makeId()),
    createdAt,
    updatedAt: item.updatedAt || createdAt,
  };

  await dynamo.send(new PutCommand({
    TableName: tableName,
    Item: next,
  }));

  return next;
}

export async function patchItem(tableName, id, updates) {
  const entries = Object.entries({ ...updates, updatedAt: nowIso() }).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return getItem(tableName, id);

  const names = {};
  const values = {};
  const assignments = entries.map(([key, value], index) => {
    const nameKey = `#k${index}`;
    const valueKey = `:v${index}`;
    names[nameKey] = key;
    values[valueKey] = value;
    return `${nameKey} = ${valueKey}`;
  });

  const result = await dynamo.send(new UpdateCommand({
    TableName: tableName,
    Key: { id: String(id) },
    UpdateExpression: `SET ${assignments.join(', ')}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ReturnValues: 'ALL_NEW',
  }));

  return result.Attributes || null;
}

export async function deleteItem(tableName, id) {
  await dynamo.send(new DeleteCommand({
    TableName: tableName,
    Key: { id: String(id) },
  }));
}

export function sortByCreatedDesc(a, b) {
  return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
}

export function sortByOrderThenCreated(a, b) {
  const orderDiff = Number(a.order ?? 999) - Number(b.order ?? 999);
  if (orderDiff !== 0) return orderDiff;
  return sortByCreatedDesc(a, b);
}
