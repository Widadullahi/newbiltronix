import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import {
  deleteItem,
  getItem,
  listItems,
  nowIso,
  patchItem,
  putItem,
  queryItems,
  sortByCreatedDesc,
  sortByOrderThenCreated,
  tables,
} from './dynamoStore.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const configuredAllowedOrigins = String(process.env.API_CORS_ORIGINS || '').split(',').map((x) => x.trim()).filter(Boolean);
const defaultAllowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:4000', 'http://127.0.0.1:4000'];
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...configuredAllowedOrigins])];
const jwtSecret = String(process.env.JWT_SECRET || '');
const accessTokenExpiresIn = String(process.env.ACCESS_TOKEN_EXPIRES_IN || '15m');
const refreshTokenExpiresIn = String(process.env.REFRESH_TOKEN_EXPIRES_IN || '30d');
const smtpHost = String(process.env.SMTP_HOST || '');
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = String(process.env.SMTP_USER || '');
const smtpPass = String(process.env.SMTP_PASS || '');
const smtpSecure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
const smtpFrom = String(process.env.SMTP_FROM || '');
const nodeEnv = String(process.env.NODE_ENV || 'development');

if (!jwtSecret) {
  console.error('Missing JWT_SECRET in API environment.');
  process.exit(1);
}

const mailer = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({ host: smtpHost, port: smtpPort, secure: smtpSecure, auth: { user: smtpUser, pass: smtpPass } })
  : null;

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    if (/^https?:\/\/localhost(?::\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(?::\d+)?$/.test(origin)) return callback(null, true);
    if (/\.amazonaws\.com$/i.test(origin) || /\.amplifyapp\.com$/i.test(origin) || /\.cloudfront\.net$/i.test(origin)) return callback(null, true);
    callback(new Error('CORS blocked'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '25mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

const toInt = (v, f = 0) => (Number.isFinite(Number.parseInt(String(v), 10)) ? Number.parseInt(String(v), 10) : f);
const safeString = (v) => String(v || '').trim();
const hashValue = (v) => createHash('sha256').update(String(v)).digest('hex');
const signAccessToken = (payload) => jwt.sign(payload, jwtSecret, { expiresIn: accessTokenExpiresIn });
const sendError = (res, status, message) => res.status(status).json({ error: message });
const makeBookingCode = () => `BK-${Math.floor(Math.random() * 9000) + 1000}`;
const makeOrderCode = () => `OR-${Math.floor(Math.random() * 9000) + 1000}`;
const makeOtpCode = () => String(randomInt(100000, 1000000));

function expiresAtFromNow(duration, fallbackMs = 30 * 24 * 60 * 60 * 1000) {
  const m = /^\s*(\d+)\s*([smhd])\s*$/i.exec(String(duration || ''));
  if (!m) return new Date(Date.now() + fallbackMs);
  const n = Number(m[1]);
  const mult = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return new Date(Date.now() + n * (mult[m[2].toLowerCase()] || 86400000));
}

function normalizeBooking(row) {
  return { _id: row.id, id: row.bookingCode || row.id, customer: row.customer || 'Unknown Customer', service: row.service || 'General Service', date: row.date || '', status: row.status || 'Pending' };
}

function normalizeOrder(row) {
  const amountValue = Number(row.amount || 0);
  return { _id: row.id, id: row.orderCode || row.id, item: row.item || 'Unknown Item', customer: row.customer || 'Unknown Customer', channel: row.channel || 'Website', amountValue, amountLabel: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amountValue) };
}

function normalizeStockItem(row) {
  return { _id: row.id, name: row.name || 'Untitled Item', description: row.description || '', primaryImageUrl: row.primaryImageUrl || '', featureImageUrl: row.featureImageUrl || '', otherImageUrls: Array.isArray(row.otherImageUrls) ? row.otherImageUrls : [], soldOut: Boolean(row.soldOut), category: row.category || 'car-parts', stock: toInt(row.stock), sold: toInt(row.sold), unitPrice: toInt(row.unitPrice), offerPrice: toInt(row.offerPrice), color: row.color || '', mileage: row.mileage || '', make: row.make || '', model: row.model || '', year: toInt(row.year), condition: row.condition || '', transmission: row.transmission || '', fuelType: row.fuelType || '' };
}

function normalizeCarTip(row) {
  return { _id: row.id, title: row.title || 'Untitled Tip', body: row.body || '', category: row.category || 'General', imageUrl: row.imageUrl || '', order: toInt(row.order, 999) };
}

function normalizeStoreHighlight(row) {
  return { _id: row.id, title: row.title || 'Untitled Category', summary: row.summary || '', category: row.category || 'General', ctaLabel: row.ctaLabel || 'Browse Store', ctaHref: row.ctaHref || '/sales', order: toInt(row.order, 999) };
}

function normalizeInspectorAccount(row) {
  return { _id: row.id, fullName: row.fullName || '', email: row.email || '', phone: row.phone || '', companyName: row.companyName || '', companyAddress: row.companyAddress || '', signatureDataUrl: row.signatureDataUrl || '', companyLogoDataUrl: row.companyLogoDataUrl || '' };
}

function normalizeInspectionReport(row) {
  return { _id: row.id, accountId: String(row.accountId || ''), companyName: row.companyName || '', inspectorName: row.inspectorName || '', vehicleLabel: row.vehicleLabel || '', vehicleRegNo: row.vehicleRegNo || '', vin: row.vin || '', mileage: row.mileage || '', transmission: row.transmission || '', fuelType: row.fuelType || '', inspectedAt: row.inspectedAt || '', checklist: Array.isArray(row.checklist) ? row.checklist : [], images: Array.isArray(row.images) ? row.images : [], overallVerdict: row.overallVerdict || 'Pending', recommendation: row.recommendation || '' };
}

async function findOne(tableName, predicate, limit = 1000) {
  const rows = await listItems(tableName, { limit });
  return rows.find(predicate) || null;
}

async function findInspectorByEmail(email) {
  const rows = await queryItems(tables.inspectorAccounts, 'email-index', '#email = :email', { ':email': email }, { '#email': 'email' }, 1);
  return rows[0] || null;
}

async function findRefreshToken(role, tokenHash) {
  const rows = await queryItems(tables.refreshTokens, 'tokenHash-index', 'tokenHash = :tokenHash', { ':tokenHash': tokenHash }, undefined, 5);
  return rows.find((row) => row.role === role) || null;
}

async function createRefreshToken(role, subjectId) {
  const token = randomBytes(48).toString('hex');
  const record = await putItem(tables.refreshTokens, {
    role,
    subjectId: String(subjectId),
    tokenHash: hashValue(token),
    expiresAt: expiresAtFromNow(refreshTokenExpiresIn).toISOString(),
    revokedAt: '',
    replacedById: '',
  });
  return { id: record.id, token };
}

async function rotateRefreshToken(role, token) {
  const tokenHash = hashValue(token);
  const existing = await findRefreshToken(role, tokenHash);
  if (!existing || existing.revokedAt || String(existing.expiresAt || '') <= nowIso()) return null;
  const next = await createRefreshToken(role, existing.subjectId);
  await patchItem(tables.refreshTokens, existing.id, { revokedAt: nowIso(), replacedById: next.id });
  return { subjectId: String(existing.subjectId), refreshToken: next.token };
}

async function revokeRefreshToken(role, token) {
  const tokenHash = hashValue(token);
  const existing = await findRefreshToken(role, tokenHash);
  if (existing) await patchItem(tables.refreshTokens, existing.id, { revokedAt: nowIso() });
}

async function revokeAllSubjectTokens(role, subjectId) {
  const rows = await queryItems(tables.refreshTokens, 'subjectId-index', 'subjectId = :subjectId', { ':subjectId': String(subjectId) }, undefined, 2000);
  await Promise.all(rows
    .filter((row) => row.role === role && String(row.subjectId) === String(subjectId) && !row.revokedAt)
    .map((row) => patchItem(tables.refreshTokens, row.id, { revokedAt: nowIso() })));
}

function requireAuth(req, res, next) {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return sendError(res, 401, 'Authorization token is required.');
  try {
    req.auth = jwt.verify(token, jwtSecret);
    next();
  } catch {
    sendError(res, 401, 'Invalid or expired token.');
  }
}

const requireRole = (role) => (req, res, next) => {
  if (!req.auth || req.auth.role !== role) return sendError(res, 403, 'Access denied.');
  next();
};

function requireInspectorSelf(req, res, next) {
  const targetId = String(req.params.id || '');
  if (!req.auth || req.auth.role !== 'inspector' || targetId !== String(req.auth.inspectorId || '')) {
    return sendError(res, 403, 'You can only update your own account.');
  }
  next();
}

async function sendOtpEmail(email, otp) {
  if (!mailer || !smtpFrom) {
    if (nodeEnv !== 'production') console.info(`DEV OTP for ${email}: ${otp}`);
    return false;
  }
  await mailer.sendMail({
    from: smtpFrom,
    to: email,
    subject: 'Biltronix Password Reset OTP',
    text: `Your Biltronix OTP is ${otp}. It expires in 15 minutes.`,
    html: `<p>Your Biltronix OTP is <strong>${otp}</strong>.</p><p>It expires in 15 minutes.</p>`,
  });
  return true;
}

async function seedStoreHighlights() {
  const existing = await listItems(tables.storeHighlights, { limit: 1 });
  if (existing.length > 0) return;
  await Promise.all([
    putItem(tables.storeHighlights, { title: 'Vehicles', summary: 'Inspected sedans, SUVs, and premium options ready for immediate delivery.', category: 'Vehicles', ctaLabel: 'Browse Vehicles', ctaHref: '/sales#products', order: 1 }),
    putItem(tables.storeHighlights, { title: 'Car Parts', summary: 'OEM-grade parts including brake kits, filters, batteries, and service components.', category: 'Car Parts', ctaLabel: 'Browse Parts', ctaHref: '/sales#products', order: 2 }),
    putItem(tables.storeHighlights, { title: 'Accessories', summary: 'Dash cams, seat covers, phone mounts, and practical interior upgrades.', category: 'Accessories', ctaLabel: 'Browse Accessories', ctaHref: '/sales#products', order: 3 }),
  ]);
}

app.get('/api/health', (_req, res) => res.json({ ok: true, storage: 'dynamodb' }));

app.post('/api/admin/login', authLimiter, async (req, res) => {
  const email = safeString(req.body?.email).toLowerCase();
  const password = String(req.body?.password || '');
  const adminEmail = safeString(process.env.ADMIN_EMAIL).toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || '');
  if (!adminEmail || !adminPassword) return sendError(res, 500, 'Admin credentials are not configured on the server.');
  if (email !== adminEmail || password !== adminPassword) return sendError(res, 401, 'Invalid admin email or password.');
  const refresh = await createRefreshToken('admin', adminEmail);
  res.json({ success: true, accessToken: signAccessToken({ role: 'admin', email: adminEmail }), refreshToken: refresh.token });
});

app.post('/api/auth/refresh', async (req, res) => {
  const role = safeString(req.body?.role);
  const refreshToken = String(req.body?.refreshToken || '');
  if (!['admin', 'inspector'].includes(role) || !refreshToken) return sendError(res, 400, 'Role and refresh token are required.');
  const rotated = await rotateRefreshToken(role, refreshToken);
  if (!rotated) return sendError(res, 401, 'Invalid or expired refresh token.');
  if (role === 'admin') {
    const adminEmail = safeString(process.env.ADMIN_EMAIL).toLowerCase();
    if (!adminEmail || rotated.subjectId !== adminEmail) return sendError(res, 401, 'Invalid refresh subject.');
    return res.json({ accessToken: signAccessToken({ role: 'admin', email: adminEmail }), refreshToken: rotated.refreshToken });
  }
  const account = await getItem(tables.inspectorAccounts, rotated.subjectId);
  if (!account) return sendError(res, 401, 'Inspector account not found.');
  res.json({ accessToken: signAccessToken({ role: 'inspector', inspectorId: account.id, email: account.email }), refreshToken: rotated.refreshToken });
});

app.post('/api/auth/logout', async (req, res) => {
  const role = safeString(req.body?.role);
  const refreshToken = String(req.body?.refreshToken || '');
  if (!['admin', 'inspector'].includes(role) || !refreshToken) return sendError(res, 400, 'Role and refresh token are required.');
  await revokeRefreshToken(role, refreshToken);
  res.json({ success: true });
});

app.get('/api/dashboard', requireAuth, requireRole('admin'), async (_req, res) => {
  try {
    const [bookings, orders] = await Promise.all([
      listItems(tables.bookings, { limit: 150 }),
      listItems(tables.orders, { limit: 150 }),
    ]);
    res.json({ bookings: bookings.sort(sortByCreatedDesc).map(normalizeBooking), orders: orders.sort(sortByCreatedDesc).map(normalizeOrder), inventory: [] });
  } catch {
    sendError(res, 500, 'Failed to load dashboard data.');
  }
});

app.get('/api/car-tips', async (req, res) => {
  const limit = Math.max(1, Math.min(500, toInt(req.query.limit, 6)));
  try {
    const rows = await listItems(tables.carTips, { limit: 500 });
    res.json(rows.sort(sortByOrderThenCreated).slice(0, limit).map(normalizeCarTip));
  } catch {
    sendError(res, 500, 'Failed to load car tips.');
  }
});

app.post('/api/car-tips', requireAuth, requireRole('admin'), async (req, res) => {
  const title = safeString(req.body?.title);
  const body = safeString(req.body?.body);
  if (!title || !body) return sendError(res, 400, 'Tip title and content are required.');
  try {
    const row = await putItem(tables.carTips, { title, body, category: safeString(req.body?.category) || 'General', imageUrl: String(req.body?.imageUrl || ''), order: toInt(req.body?.order, 999) });
    res.status(201).json(normalizeCarTip(row));
  } catch {
    sendError(res, 500, 'Could not add car tip.');
  }
});

app.patch('/api/car-tips/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = String(req.params.id || '');
  try {
    const existing = await getItem(tables.carTips, id);
    if (!existing) return sendError(res, 404, 'Tip not found.');
    const updated = await patchItem(tables.carTips, id, {
      title: safeString(req.body?.title) || existing.title,
      body: safeString(req.body?.body) || existing.body,
      category: safeString(req.body?.category) || existing.category,
      imageUrl: req.body?.imageUrl === undefined ? (existing.imageUrl || '') : String(req.body?.imageUrl || ''),
      order: Number.isFinite(Number(req.body?.order)) ? toInt(req.body?.order) : toInt(existing.order, 999),
    });
    res.json(normalizeCarTip(updated));
  } catch {
    sendError(res, 500, 'Could not update car tip.');
  }
});

app.delete('/api/car-tips/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = String(req.params.id || '');
  try {
    await deleteItem(tables.carTips, id);
    res.json({ deletedId: id });
  } catch {
    sendError(res, 500, 'Could not delete car tip.');
  }
});

app.get('/api/store-highlights', async (req, res) => {
  const limit = Math.max(1, Math.min(100, toInt(req.query.limit, 6)));
  try {
    const rows = await listItems(tables.storeHighlights, { limit: 100 });
    res.json(rows.sort(sortByOrderThenCreated).slice(0, limit).map(normalizeStoreHighlight));
  } catch {
    sendError(res, 500, 'Failed to load store highlights.');
  }
});

app.get('/api/stock-items', async (req, res) => {
  const limit = Math.max(1, Math.min(2000, toInt(req.query.limit, 300)));
  try {
    const rows = await listItems(tables.stockItems, { limit });
    res.json(rows.sort((a, b) => `${a.category || ''}${a.name || ''}`.localeCompare(`${b.category || ''}${b.name || ''}`)).map(normalizeStockItem));
  } catch {
    sendError(res, 500, 'Failed to load stock items.');
  }
});

app.post('/api/bookings', async (req, res) => {
  const customer = safeString(req.body?.customer);
  const service = safeString(req.body?.service);
  const date = safeString(req.body?.date);
  if (!customer || !service || !date) return sendError(res, 400, 'Customer name, service, and appointment date are required.');
  try {
    const row = await putItem(tables.bookings, { bookingCode: makeBookingCode(), customer, service, date, status: 'Pending', whatsappNumber: safeString(req.body?.whatsappNumber), vehicle: safeString(req.body?.vehicle), email: safeString(req.body?.email), note: safeString(req.body?.note) });
    res.status(201).json(normalizeBooking(row));
  } catch {
    sendError(res, 500, 'Could not save booking request.');
  }
});

app.post('/api/orders', requireAuth, requireRole('admin'), async (req, res) => {
  const item = safeString(req.body?.item);
  const customer = safeString(req.body?.customer);
  if (!item || !customer) return sendError(res, 400, 'Item and customer are required.');
  const amount = Number(req.body?.amount || 0);
  try {
    const row = await putItem(tables.orders, { orderCode: makeOrderCode(), item, customer, amount: Number.isFinite(amount) ? amount : 0, channel: safeString(req.body?.channel) || 'Website' });
    res.status(201).json(normalizeOrder(row));
  } catch {
    sendError(res, 500, 'Could not create order.');
  }
});

app.post('/api/stock-items', requireAuth, requireRole('admin'), async (req, res) => {
  const name = safeString(req.body?.name);
  if (!name) return sendError(res, 400, 'Item name is required.');
  try {
    const row = await putItem(tables.stockItems, {
      name,
      description: safeString(req.body?.description),
      primaryImageUrl: String(req.body?.primaryImageUrl || ''),
      featureImageUrl: String(req.body?.featureImageUrl || ''),
      otherImageUrls: Array.isArray(req.body?.otherImageUrls) ? req.body.otherImageUrls : [],
      soldOut: Boolean(req.body?.soldOut),
      category: safeString(req.body?.category) || 'car-parts',
      stock: toInt(req.body?.stock),
      sold: toInt(req.body?.sold),
      unitPrice: toInt(req.body?.unitPrice),
      offerPrice: toInt(req.body?.offerPrice),
      color: safeString(req.body?.color),
      mileage: safeString(req.body?.mileage),
      make: safeString(req.body?.make),
      model: safeString(req.body?.model),
      year: toInt(req.body?.year),
      condition: safeString(req.body?.condition),
      transmission: safeString(req.body?.transmission),
      fuelType: safeString(req.body?.fuelType),
    });
    res.status(201).json(normalizeStockItem(row));
  } catch {
    sendError(res, 500, 'Could not add stock item.');
  }
});

app.patch('/api/stock-items/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = String(req.params.id || '');
  try {
    const existing = await getItem(tables.stockItems, id);
    if (!existing) return sendError(res, 404, 'Item not found.');
    const updated = await patchItem(tables.stockItems, id, {
      name: safeString(req.body?.name) || existing.name,
      description: req.body?.description === undefined ? (existing.description || '') : safeString(req.body?.description),
      primaryImageUrl: req.body?.primaryImageUrl === undefined ? (existing.primaryImageUrl || '') : String(req.body?.primaryImageUrl || ''),
      featureImageUrl: req.body?.featureImageUrl === undefined ? (existing.featureImageUrl || '') : String(req.body?.featureImageUrl || ''),
      otherImageUrls: Array.isArray(req.body?.otherImageUrls) ? req.body.otherImageUrls : (Array.isArray(existing.otherImageUrls) ? existing.otherImageUrls : []),
      soldOut: req.body?.soldOut === undefined ? Boolean(existing.soldOut) : Boolean(req.body?.soldOut),
      stock: req.body?.stock === undefined ? toInt(existing.stock) : toInt(req.body?.stock),
      sold: req.body?.sold === undefined ? toInt(existing.sold) : toInt(req.body?.sold),
      unitPrice: req.body?.unitPrice === undefined ? toInt(existing.unitPrice) : toInt(req.body?.unitPrice),
      offerPrice: req.body?.offerPrice === undefined ? toInt(existing.offerPrice) : toInt(req.body?.offerPrice),
      color: req.body?.color === undefined ? (existing.color || '') : safeString(req.body?.color),
      mileage: req.body?.mileage === undefined ? (existing.mileage || '') : safeString(req.body?.mileage),
      make: req.body?.make === undefined ? (existing.make || '') : safeString(req.body?.make),
      model: req.body?.model === undefined ? (existing.model || '') : safeString(req.body?.model),
      year: req.body?.year === undefined ? toInt(existing.year) : toInt(req.body?.year),
      condition: req.body?.condition === undefined ? (existing.condition || '') : safeString(req.body?.condition),
      transmission: req.body?.transmission === undefined ? (existing.transmission || '') : safeString(req.body?.transmission),
      fuelType: req.body?.fuelType === undefined ? (existing.fuelType || '') : safeString(req.body?.fuelType),
    });
    res.json(normalizeStockItem(updated));
  } catch {
    sendError(res, 500, 'Could not update stock item.');
  }
});

app.patch('/api/stock-items/:id/sold-status', requireAuth, requireRole('admin'), async (req, res) => {
  const id = String(req.params.id || '');
  try {
    const existing = await getItem(tables.stockItems, id);
    if (!existing) return sendError(res, 404, 'Item not found.');
    const updated = await patchItem(tables.stockItems, id, { soldOut: Boolean(req.body?.soldOut) });
    res.json(normalizeStockItem(updated));
  } catch {
    sendError(res, 500, 'Could not update sold status.');
  }
});

app.delete('/api/stock-items/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = String(req.params.id || '');
  try {
    await deleteItem(tables.stockItems, id);
    res.json({ deletedId: id });
  } catch {
    sendError(res, 500, 'Could not delete stock item.');
  }
});

app.post('/api/inspectors/register', authLimiter, async (req, res) => {
  const fullName = safeString(req.body?.fullName);
  const email = safeString(req.body?.email).toLowerCase();
  const password = String(req.body?.password || '');
  if (!fullName || !email || password.length < 6) return sendError(res, 400, 'Full name, valid email, and password (min 6 chars) are required.');
  try {
    const exists = await findInspectorByEmail(email);
    if (exists) return sendError(res, 409, 'An account with this email already exists. Please log in instead.');
    const row = await putItem(tables.inspectorAccounts, { fullName, email, passwordHash: await bcrypt.hash(password, 10), phone: safeString(req.body?.phone), companyName: safeString(req.body?.companyName), companyAddress: safeString(req.body?.companyAddress), signatureDataUrl: String(req.body?.signatureDataUrl || ''), companyLogoDataUrl: String(req.body?.companyLogoDataUrl || '') });
    const account = normalizeInspectorAccount(row);
    const refresh = await createRefreshToken('inspector', account._id);
    res.status(201).json({ account, accessToken: signAccessToken({ role: 'inspector', inspectorId: account._id, email: account.email }), refreshToken: refresh.token });
  } catch {
    sendError(res, 500, 'Could not create inspector account.');
  }
});

app.post('/api/inspectors/login', authLimiter, async (req, res) => {
  const email = safeString(req.body?.email).toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) return sendError(res, 400, 'Email and password are required.');
  try {
    const row = await findInspectorByEmail(email);
    if (!row || !(await bcrypt.compare(password, row.passwordHash || ''))) return sendError(res, 401, 'Invalid email or password.');
    const account = normalizeInspectorAccount(row);
    const refresh = await createRefreshToken('inspector', account._id);
    res.json({ account, accessToken: signAccessToken({ role: 'inspector', inspectorId: account._id, email: account.email }), refreshToken: refresh.token });
  } catch {
    sendError(res, 500, 'Could not login.');
  }
});

app.post('/api/inspectors/password-reset/request', authLimiter, async (req, res) => {
  const email = safeString(req.body?.email).toLowerCase();
  if (!email) return sendError(res, 400, 'Email is required.');
  try {
    const account = await findInspectorByEmail(email);
    let debugOtp = '';
    if (account) {
      const otp = makeOtpCode();
      await putItem(tables.passwordResetOtps, { email, otpHash: hashValue(`${otp}:${jwtSecret}`), expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), usedAt: '', attempts: 0 });
      await sendOtpEmail(email, otp);
      if (nodeEnv !== 'production' && (!mailer || !smtpFrom)) debugOtp = otp;
    }
    res.json({ success: true, message: 'If the email exists, an OTP has been sent.', ...(debugOtp ? { devOtp: debugOtp } : {}) });
  } catch {
    sendError(res, 500, 'Could not process password reset request.');
  }
});

app.post('/api/inspectors/password-reset/confirm', authLimiter, async (req, res) => {
  const email = safeString(req.body?.email).toLowerCase();
  const otp = safeString(req.body?.otp);
  const newPassword = String(req.body?.newPassword || '');
  if (!email || !otp || newPassword.length < 6) return sendError(res, 400, 'Email, OTP, and new password (min 6 chars) are required.');
  try {
    const rows = await listItems(tables.passwordResetOtps, { limit: 1000 });
    const row = rows.filter((item) => item.email === email && !item.usedAt && String(item.expiresAt || '') > nowIso()).sort(sortByCreatedDesc)[0];
    if (!row) return sendError(res, 400, 'Invalid or expired OTP.');
    if (toInt(row.attempts) >= 5) return sendError(res, 429, 'Too many OTP attempts. Request a new OTP.');
    if (hashValue(`${otp}:${jwtSecret}`) !== row.otpHash) {
      await patchItem(tables.passwordResetOtps, row.id, { attempts: toInt(row.attempts) + 1 });
      return sendError(res, 400, 'Invalid or expired OTP.');
    }
    const account = await findInspectorByEmail(email);
    if (!account) return sendError(res, 400, 'Invalid password reset request.');
    await patchItem(tables.inspectorAccounts, account.id, { passwordHash: await bcrypt.hash(newPassword, 10) });
    await patchItem(tables.passwordResetOtps, row.id, { usedAt: nowIso() });
    await revokeAllSubjectTokens('inspector', account.id);
    res.json({ success: true, message: 'Password reset successful. Please log in again.' });
  } catch {
    sendError(res, 500, 'Could not reset password.');
  }
});

app.patch('/api/inspectors/:id', requireAuth, requireInspectorSelf, async (req, res) => {
  const id = String(req.params.id || '');
  try {
    const existing = await getItem(tables.inspectorAccounts, id);
    if (!existing) return sendError(res, 404, 'Account not found.');
    const email = safeString(req.body?.email || existing.email).toLowerCase();
    const owner = await findInspectorByEmail(email);
    if (owner && owner.id !== id) return sendError(res, 409, 'Email is already in use by another inspector account.');
    const updated = await patchItem(tables.inspectorAccounts, id, {
      fullName: safeString(req.body?.fullName || existing.fullName),
      email,
      phone: safeString(req.body?.phone || existing.phone),
      companyName: safeString(req.body?.companyName || existing.companyName),
      companyAddress: safeString(req.body?.companyAddress || existing.companyAddress),
      signatureDataUrl: String(req.body?.signatureDataUrl ?? existing.signatureDataUrl ?? ''),
      companyLogoDataUrl: String(req.body?.companyLogoDataUrl ?? existing.companyLogoDataUrl ?? ''),
    });
    res.json(normalizeInspectorAccount(updated));
  } catch {
    sendError(res, 500, 'Could not update account.');
  }
});

app.post('/api/inspection-reports', requireAuth, requireRole('inspector'), async (req, res) => {
  const accountId = String(req.body?.accountId || '');
  const inspectedAt = safeString(req.body?.inspectedAt);
  if (!accountId || !inspectedAt) return sendError(res, 400, 'Account ID and inspection date are required.');
  if (accountId !== String(req.auth.inspectorId || '')) return sendError(res, 403, 'You can only create reports for your account.');
  try {
    const account = await getItem(tables.inspectorAccounts, accountId);
    if (!account) return sendError(res, 404, 'Inspector account not found.');
    const row = await putItem(tables.inspectionReports, {
      accountId,
      companyName: safeString(req.body?.companyName),
      inspectorName: safeString(req.body?.inspectorName),
      vehicleLabel: safeString(req.body?.vehicleLabel),
      vehicleRegNo: safeString(req.body?.vehicleRegNo),
      vin: safeString(req.body?.vin),
      mileage: safeString(req.body?.mileage),
      transmission: safeString(req.body?.transmission),
      fuelType: safeString(req.body?.fuelType),
      inspectedAt,
      checklist: Array.isArray(req.body?.checklist) ? req.body.checklist : [],
      images: Array.isArray(req.body?.images) ? req.body.images : [],
      overallVerdict: safeString(req.body?.overallVerdict) || 'Pending',
      recommendation: safeString(req.body?.recommendation),
    });
    res.status(201).json(normalizeInspectionReport(row));
  } catch {
    sendError(res, 500, 'Could not save inspection report.');
  }
});

app.get('/api/inspection-reports', requireAuth, requireRole('inspector'), async (req, res) => {
  const accountId = String(req.query.accountId || '');
  if (!accountId) return sendError(res, 400, 'accountId is required.');
  if (accountId !== String(req.auth.inspectorId || '')) return sendError(res, 403, 'You can only view your own reports.');
  try {
    const rows = await queryItems(tables.inspectionReports, 'accountId-index', 'accountId = :accountId', { ':accountId': accountId }, undefined, 1000);
    res.json(rows.sort((a, b) => String(b.inspectedAt || '').localeCompare(String(a.inspectedAt || ''))).map(normalizeInspectionReport));
  } catch {
    sendError(res, 500, 'Could not load inspection reports.');
  }
});

app.use((err, _req, res, _next) => {
  const message = err && typeof err.message === 'string' ? err.message : 'Unexpected server error.';
  sendError(res, 500, message);
});

async function bootstrap() {
  await seedStoreHighlights();
  app.listen(port, () => {
    console.log(`Biltronix API running at http://localhost:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start API:', err);
  process.exit(1);
});
