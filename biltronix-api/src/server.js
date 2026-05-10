
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import mysql from 'mysql2/promise';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = String(process.env.API_CORS_ORIGINS || '').split(',').map((x) => x.trim()).filter(Boolean);
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

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS blocked'));
  },
  credentials: false,
}));
app.use(express.json({ limit: '25mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'biltronix_db',
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

const toInt = (v, f = 0) => (Number.isFinite(Number.parseInt(String(v), 10)) ? Number.parseInt(String(v), 10) : f);
const safeString = (v) => String(v || '').trim();
const hashValue = (v) => createHash('sha256').update(String(v)).digest('hex');

function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function expiresAtFromNow(duration, fallbackMs = 30 * 24 * 60 * 60 * 1000) {
  const m = /^\s*(\d+)\s*([smhd])\s*$/i.exec(String(duration || ''));
  if (!m) return new Date(Date.now() + fallbackMs);
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const mult = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return new Date(Date.now() + n * (mult[unit] || 86400000));
}

const signAccessToken = (payload) => jwt.sign(payload, jwtSecret, { expiresIn: accessTokenExpiresIn });
const sendError = (res, status, message) => res.status(status).json({ error: message });

function normalizeBooking(row) {
  return { _id: String(row.id), id: row.booking_code || String(row.id), customer: row.customer || 'Unknown Customer', service: row.service || 'General Service', date: row.date || '', status: row.status || 'Pending' };
}
function normalizeOrder(row) {
  const amountValue = Number(row.amount || 0);
  return { _id: String(row.id), id: row.order_code || String(row.id), item: row.item || 'Unknown Item', customer: row.customer || 'Unknown Customer', channel: row.channel || 'Website', amountValue, amountLabel: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amountValue) };
}
function normalizeStockItem(row) {
  return { _id: String(row.id), name: row.name || 'Untitled Item', description: row.description || '', primaryImageUrl: row.primary_image_url || '', featureImageUrl: row.feature_image_url || '', otherImageUrls: parseJsonArray(row.other_image_urls), soldOut: Boolean(row.sold_out), category: row.category || 'car-parts', stock: toInt(row.stock), sold: toInt(row.sold), unitPrice: toInt(row.unit_price), make: row.make || '', model: row.model || '', year: toInt(row.year), condition: row.condition || '', transmission: row.transmission || '', fuelType: row.fuel_type || '' };
}
function normalizeCarTip(row) {
  return { _id: String(row.id), title: row.title || 'Untitled Tip', body: row.body || '', category: row.category || 'General', imageUrl: row.image_url || '', order: toInt(row.display_order, 999) };
}
function normalizeStoreHighlight(row) {
  return { _id: String(row.id), title: row.title || 'Untitled Category', summary: row.summary || '', category: row.category || 'General', ctaLabel: row.cta_label || 'Browse Store', ctaHref: row.cta_href || '/sales', order: toInt(row.display_order, 999) };
}
function normalizeInspectorAccount(row) {
  return { _id: String(row.id), fullName: row.full_name || '', email: row.email || '', phone: row.phone || '', companyName: row.company_name || '', companyAddress: row.company_address || '', signatureDataUrl: row.signature_data_url || '', companyLogoDataUrl: row.company_logo_data_url || '' };
}
function normalizeInspectionReport(row) {
  return { _id: String(row.id), accountId: String(row.account_id || ''), companyName: row.company_name || '', inspectorName: row.inspector_name || '', vehicleLabel: row.vehicle_label || '', vehicleRegNo: row.vehicle_reg_no || '', vin: row.vin || '', mileage: row.mileage || '', transmission: row.transmission || '', fuelType: row.fuel_type || '', inspectedAt: row.inspected_at || '', checklist: parseJsonArray(row.checklist), images: parseJsonArray(row.images), overallVerdict: row.overall_verdict || 'Pending', recommendation: row.recommendation || '' };
}

const makeBookingCode = () => `BK-${Math.floor(Math.random() * 9000) + 1000}`;
const makeOrderCode = () => `OR-${Math.floor(Math.random() * 9000) + 1000}`;
const makeOtpCode = () => String(randomInt(100000, 1000000));

async function createRefreshToken(role, subjectId) {
  const token = randomBytes(48).toString('hex');
  const tokenHash = hashValue(token);
  const expiresAt = expiresAtFromNow(refreshTokenExpiresIn);
  const [result] = await pool.query('INSERT INTO refresh_tokens (role, subject_id, token_hash, expires_at) VALUES (?, ?, ?, ?)', [role, String(subjectId), tokenHash, expiresAt]);
  return { id: result.insertId, token };
}

async function rotateRefreshToken(role, token) {
  const [rows] = await pool.query(
    'SELECT * FROM refresh_tokens WHERE role = ? AND token_hash = ? AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1',
    [role, hashValue(token)]
  );
  const existing = rows[0];
  if (!existing) return null;
  const next = await createRefreshToken(role, existing.subject_id);
  await pool.query('UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by_id = ? WHERE id = ?', [next.id, existing.id]);
  return { subjectId: String(existing.subject_id), refreshToken: next.token };
}

async function revokeRefreshToken(role, token) {
  await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE role = ? AND token_hash = ? AND revoked_at IS NULL', [role, hashValue(token)]);
}

async function revokeAllSubjectTokens(role, subjectId) {
  await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE role = ? AND subject_id = ? AND revoked_at IS NULL', [role, String(subjectId)]);
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
  const targetId = toInt(req.params.id);
  if (!req.auth || req.auth.role !== 'inspector' || targetId !== toInt(req.auth.inspectorId)) {
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

async function initSchema() {
  const schemaPath = path.join(__dirname, '../sql/schema.sql');
  const sql = await fs.readFile(schemaPath, 'utf8');
  const statements = sql.split(';').map((s) => s.trim()).filter(Boolean);
  const conn = await pool.getConnection();
  try {
    for (const statement of statements) {
      try {
        await conn.query(statement);
      } catch (err) {
        if (err?.code === 'ER_DUP_KEYNAME' || err?.code === 'ER_DUP_FIELDNAME') continue;
        throw err;
      }
    }
  } finally {
    conn.release();
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/admin/login', authLimiter, async (req, res) => {
  const email = safeString(req.body?.email).toLowerCase();
  const password = String(req.body?.password || '');
  const adminEmail = safeString(process.env.ADMIN_EMAIL).toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || '');

  if (!adminEmail || !adminPassword) return sendError(res, 500, 'Admin credentials are not configured on the server.');
  if (email !== adminEmail || password !== adminPassword) return sendError(res, 401, 'Invalid admin email or password.');

  const accessToken = signAccessToken({ role: 'admin', email: adminEmail });
  const refresh = await createRefreshToken('admin', adminEmail);
  res.json({ success: true, accessToken, refreshToken: refresh.token });
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

  const inspectorId = toInt(rotated.subjectId);
  const [rows] = await pool.query('SELECT * FROM inspector_accounts WHERE id = ?', [inspectorId]);
  const account = rows[0];
  if (!account) return sendError(res, 401, 'Inspector account not found.');
  res.json({ accessToken: signAccessToken({ role: 'inspector', inspectorId, email: account.email }), refreshToken: rotated.refreshToken });
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
    const [bookings] = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 150');
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 150');
    res.json({ bookings: bookings.map(normalizeBooking), orders: orders.map(normalizeOrder), inventory: [] });
  } catch {
    sendError(res, 500, 'Failed to load dashboard data.');
  }
});

app.get('/api/car-tips', async (req, res) => {
  const limit = Math.max(1, Math.min(500, toInt(req.query.limit, 6)));
  try {
    const [rows] = await pool.query('SELECT * FROM car_tips ORDER BY display_order ASC, created_at DESC LIMIT ?', [limit]);
    res.json(rows.map(normalizeCarTip));
  } catch {
    sendError(res, 500, 'Failed to load car tips.');
  }
});

app.post('/api/car-tips', requireAuth, requireRole('admin'), async (req, res) => {
  const title = safeString(req.body?.title);
  const body = safeString(req.body?.body);
  if (!title || !body) return sendError(res, 400, 'Tip title and content are required.');
  const category = safeString(req.body?.category) || 'General';
  const imageUrl = String(req.body?.imageUrl || '');
  const order = toInt(req.body?.order, 999);
  try {
    const [result] = await pool.query('INSERT INTO car_tips (title, body, category, image_url, display_order) VALUES (?, ?, ?, ?, ?)', [title, body, category, imageUrl, order]);
    const [rows] = await pool.query('SELECT * FROM car_tips WHERE id = ?', [result.insertId]);
    res.status(201).json(normalizeCarTip(rows[0]));
  } catch {
    sendError(res, 500, 'Could not add car tip.');
  }
});

app.patch('/api/car-tips/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return sendError(res, 400, 'Invalid tip ID.');
  try {
    const [existingRows] = await pool.query('SELECT * FROM car_tips WHERE id = ?', [id]);
    const e = existingRows[0];
    if (!e) return sendError(res, 404, 'Tip not found.');
    const title = safeString(req.body?.title) || e.title;
    const body = safeString(req.body?.body) || e.body;
    const category = safeString(req.body?.category) || e.category;
    const imageUrl = String(req.body?.imageUrl || e.image_url || '');
    const order = Number.isFinite(Number(req.body?.order)) ? toInt(req.body?.order) : toInt(e.display_order, 999);
    await pool.query('UPDATE car_tips SET title = ?, body = ?, category = ?, image_url = ?, display_order = ? WHERE id = ?', [title, body, category, imageUrl, order, id]);
    const [rows] = await pool.query('SELECT * FROM car_tips WHERE id = ?', [id]);
    res.json(normalizeCarTip(rows[0]));
  } catch {
    sendError(res, 500, 'Could not update car tip.');
  }
});

app.delete('/api/car-tips/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return sendError(res, 400, 'Invalid tip ID.');
  try {
    await pool.query('DELETE FROM car_tips WHERE id = ?', [id]);
    res.json({ deletedId: String(id) });
  } catch {
    sendError(res, 500, 'Could not delete car tip.');
  }
});

app.get('/api/store-highlights', async (req, res) => {
  const limit = Math.max(1, Math.min(100, toInt(req.query.limit, 6)));
  try {
    const [rows] = await pool.query('SELECT * FROM store_highlights ORDER BY display_order ASC, created_at DESC LIMIT ?', [limit]);
    res.json(rows.map(normalizeStoreHighlight));
  } catch {
    sendError(res, 500, 'Failed to load store highlights.');
  }
});

app.get('/api/stock-items', async (req, res) => {
  const limit = Math.max(1, Math.min(2000, toInt(req.query.limit, 300)));
  try {
    const [rows] = await pool.query('SELECT * FROM stock_items ORDER BY category ASC, name ASC LIMIT ?', [limit]);
    res.json(rows.map(normalizeStockItem));
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
    const [result] = await pool.query(
      `INSERT INTO bookings (booking_code, customer, service, date, status, whatsapp_number, vehicle, email, note)
       VALUES (?, ?, ?, ?, 'Pending', ?, ?, ?, ?)`,
      [makeBookingCode(), customer, service, date, safeString(req.body?.whatsappNumber), safeString(req.body?.vehicle), safeString(req.body?.email), safeString(req.body?.note)]
    );
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [result.insertId]);
    res.status(201).json(normalizeBooking(rows[0]));
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
    const [result] = await pool.query('INSERT INTO orders (order_code, item, customer, amount, channel) VALUES (?, ?, ?, ?, ?)', [makeOrderCode(), item, customer, Number.isFinite(amount) ? amount : 0, safeString(req.body?.channel) || 'Website']);
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [result.insertId]);
    res.status(201).json(normalizeOrder(rows[0]));
  } catch {
    sendError(res, 500, 'Could not create order.');
  }
});

app.post('/api/stock-items', requireAuth, requireRole('admin'), async (req, res) => {
  const name = safeString(req.body?.name);
  if (!name) return sendError(res, 400, 'Item name is required.');
  const category = safeString(req.body?.category) || 'car-parts';
  try {
    const [result] = await pool.query(
      `INSERT INTO stock_items (
        name, description, primary_image_url, feature_image_url, other_image_urls,
        sold_out, category, stock, sold, unit_price, make, model, year, \`condition\`, transmission, fuel_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        safeString(req.body?.description),
        String(req.body?.primaryImageUrl || ''),
        String(req.body?.featureImageUrl || ''),
        JSON.stringify(Array.isArray(req.body?.otherImageUrls) ? req.body.otherImageUrls : []),
        req.body?.soldOut ? 1 : 0,
        category,
        toInt(req.body?.stock),
        toInt(req.body?.sold),
        toInt(req.body?.unitPrice),
        safeString(req.body?.make),
        safeString(req.body?.model),
        toInt(req.body?.year),
        safeString(req.body?.condition),
        safeString(req.body?.transmission),
        safeString(req.body?.fuelType),
      ]
    );
    const [rows] = await pool.query('SELECT * FROM stock_items WHERE id = ?', [result.insertId]);
    res.status(201).json(normalizeStockItem(rows[0]));
  } catch {
    sendError(res, 500, 'Could not add stock item.');
  }
});

app.patch('/api/stock-items/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return sendError(res, 400, 'Invalid item ID.');
  try {
    const [existingRows] = await pool.query('SELECT * FROM stock_items WHERE id = ?', [id]);
    const e = existingRows[0];
    if (!e) return sendError(res, 404, 'Item not found.');

    await pool.query(
      `UPDATE stock_items SET
        name = ?, description = ?, primary_image_url = ?, feature_image_url = ?, other_image_urls = ?,
        sold_out = ?, stock = ?, sold = ?, unit_price = ?, make = ?, model = ?, year = ?, \`condition\` = ?,
        transmission = ?, fuel_type = ?
      WHERE id = ?`,
      [
        safeString(req.body?.name) || e.name,
        req.body?.description === undefined ? (e.description || '') : safeString(req.body?.description),
        req.body?.primaryImageUrl === undefined ? (e.primary_image_url || '') : String(req.body?.primaryImageUrl || ''),
        req.body?.featureImageUrl === undefined ? (e.feature_image_url || '') : String(req.body?.featureImageUrl || ''),
        JSON.stringify(Array.isArray(req.body?.otherImageUrls) ? req.body.otherImageUrls : parseJsonArray(e.other_image_urls)),
        req.body?.soldOut === undefined ? Number(e.sold_out) : req.body?.soldOut ? 1 : 0,
        req.body?.stock === undefined ? toInt(e.stock) : toInt(req.body?.stock),
        req.body?.sold === undefined ? toInt(e.sold) : toInt(req.body?.sold),
        req.body?.unitPrice === undefined ? toInt(e.unit_price) : toInt(req.body?.unitPrice),
        req.body?.make === undefined ? (e.make || '') : safeString(req.body?.make),
        req.body?.model === undefined ? (e.model || '') : safeString(req.body?.model),
        req.body?.year === undefined ? toInt(e.year) : toInt(req.body?.year),
        req.body?.condition === undefined ? (e.condition || '') : safeString(req.body?.condition),
        req.body?.transmission === undefined ? (e.transmission || '') : safeString(req.body?.transmission),
        req.body?.fuelType === undefined ? (e.fuel_type || '') : safeString(req.body?.fuelType),
        id,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM stock_items WHERE id = ?', [id]);
    res.json(normalizeStockItem(rows[0]));
  } catch {
    sendError(res, 500, 'Could not update stock item.');
  }
});

app.patch('/api/stock-items/:id/sold-status', requireAuth, requireRole('admin'), async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return sendError(res, 400, 'Invalid item ID.');
  try {
    await pool.query('UPDATE stock_items SET sold_out = ? WHERE id = ?', [req.body?.soldOut ? 1 : 0, id]);
    const [rows] = await pool.query('SELECT * FROM stock_items WHERE id = ?', [id]);
    if (!rows[0]) return sendError(res, 404, 'Item not found.');
    res.json(normalizeStockItem(rows[0]));
  } catch {
    sendError(res, 500, 'Could not update sold status.');
  }
});

app.delete('/api/stock-items/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return sendError(res, 400, 'Invalid item ID.');
  try {
    await pool.query('DELETE FROM stock_items WHERE id = ?', [id]);
    res.json({ deletedId: String(id) });
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
    const [existsRows] = await pool.query('SELECT id FROM inspector_accounts WHERE email = ?', [email]);
    if (existsRows[0]) return sendError(res, 409, 'An account with this email already exists. Please log in instead.');

    const [result] = await pool.query(
      `INSERT INTO inspector_accounts (full_name, email, password_hash, phone, company_name, company_address, signature_data_url, company_logo_data_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [fullName, email, await bcrypt.hash(password, 10), safeString(req.body?.phone), safeString(req.body?.companyName), safeString(req.body?.companyAddress), String(req.body?.signatureDataUrl || ''), String(req.body?.companyLogoDataUrl || '')]
    );

    const [rows] = await pool.query('SELECT * FROM inspector_accounts WHERE id = ?', [result.insertId]);
    const account = normalizeInspectorAccount(rows[0]);
    const accessToken = signAccessToken({ role: 'inspector', inspectorId: toInt(account._id), email: account.email });
    const refresh = await createRefreshToken('inspector', account._id);
    res.status(201).json({ account, accessToken, refreshToken: refresh.token });
  } catch {
    sendError(res, 500, 'Could not create inspector account.');
  }
});

app.post('/api/inspectors/login', authLimiter, async (req, res) => {
  const email = safeString(req.body?.email).toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) return sendError(res, 400, 'Email and password are required.');

  try {
    const [rows] = await pool.query('SELECT * FROM inspector_accounts WHERE email = ? ORDER BY created_at DESC LIMIT 1', [email]);
    const accountRow = rows[0];
    if (!accountRow) return sendError(res, 401, 'Invalid email or password.');
    const matches = await bcrypt.compare(password, accountRow.password_hash);
    if (!matches) return sendError(res, 401, 'Invalid email or password.');

    const account = normalizeInspectorAccount(accountRow);
    const accessToken = signAccessToken({ role: 'inspector', inspectorId: toInt(account._id), email: account.email });
    const refresh = await createRefreshToken('inspector', account._id);
    res.json({ account, accessToken, refreshToken: refresh.token });
  } catch {
    sendError(res, 500, 'Could not login.');
  }
});

app.post('/api/inspectors/password-reset/request', authLimiter, async (req, res) => {
  const email = safeString(req.body?.email).toLowerCase();
  if (!email) return sendError(res, 400, 'Email is required.');

  try {
    const [accounts] = await pool.query('SELECT id FROM inspector_accounts WHERE email = ? LIMIT 1', [email]);
    const account = accounts[0];
    let debugOtp = '';

    if (account) {
      const otp = makeOtpCode();
      const otpHash = hashValue(`${otp}:${jwtSecret}`);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await pool.query('INSERT INTO password_reset_otps (email, otp_hash, expires_at) VALUES (?, ?, ?)', [email, otpHash, expiresAt]);
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
    const [otpRows] = await pool.query(
      `SELECT * FROM password_reset_otps
       WHERE email = ? AND used_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [email]
    );
    const row = otpRows[0];
    if (!row) return sendError(res, 400, 'Invalid or expired OTP.');
    if (toInt(row.attempts) >= 5) return sendError(res, 429, 'Too many OTP attempts. Request a new OTP.');

    const inputHash = hashValue(`${otp}:${jwtSecret}`);
    if (inputHash !== row.otp_hash) {
      await pool.query('UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = ?', [row.id]);
      return sendError(res, 400, 'Invalid or expired OTP.');
    }

    const [accounts] = await pool.query('SELECT * FROM inspector_accounts WHERE email = ? LIMIT 1', [email]);
    const account = accounts[0];
    if (!account) return sendError(res, 400, 'Invalid password reset request.');

    await pool.query('UPDATE inspector_accounts SET password_hash = ? WHERE id = ?', [await bcrypt.hash(newPassword, 10), account.id]);
    await pool.query('UPDATE password_reset_otps SET used_at = NOW() WHERE id = ?', [row.id]);
    await revokeAllSubjectTokens('inspector', account.id);

    res.json({ success: true, message: 'Password reset successful. Please log in again.' });
  } catch {
    sendError(res, 500, 'Could not reset password.');
  }
});

app.patch('/api/inspectors/:id', requireAuth, requireInspectorSelf, async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return sendError(res, 400, 'Invalid account ID.');

  try {
    const [rows] = await pool.query('SELECT * FROM inspector_accounts WHERE id = ?', [id]);
    const e = rows[0];
    if (!e) return sendError(res, 404, 'Account not found.');

    const email = safeString(req.body?.email || e.email).toLowerCase();
    const [ownerRows] = await pool.query('SELECT id FROM inspector_accounts WHERE email = ? LIMIT 1', [email]);
    if (ownerRows[0] && Number(ownerRows[0].id) !== id) return sendError(res, 409, 'Email is already in use by another inspector account.');

    await pool.query(
      `UPDATE inspector_accounts SET
        full_name = ?, email = ?, phone = ?, company_name = ?, company_address = ?, signature_data_url = ?, company_logo_data_url = ?
      WHERE id = ?`,
      [
        safeString(req.body?.fullName || e.full_name),
        email,
        safeString(req.body?.phone || e.phone),
        safeString(req.body?.companyName || e.company_name),
        safeString(req.body?.companyAddress || e.company_address),
        String(req.body?.signatureDataUrl ?? e.signature_data_url ?? ''),
        String(req.body?.companyLogoDataUrl ?? e.company_logo_data_url ?? ''),
        id,
      ]
    );

    const [updatedRows] = await pool.query('SELECT * FROM inspector_accounts WHERE id = ?', [id]);
    res.json(normalizeInspectorAccount(updatedRows[0]));
  } catch {
    sendError(res, 500, 'Could not update account.');
  }
});

app.post('/api/inspection-reports', requireAuth, requireRole('inspector'), async (req, res) => {
  const accountId = toInt(req.body?.accountId);
  const inspectedAt = safeString(req.body?.inspectedAt);
  if (!accountId || !inspectedAt) return sendError(res, 400, 'Account ID and inspection date are required.');
  if (accountId !== toInt(req.auth.inspectorId)) return sendError(res, 403, 'You can only create reports for your account.');

  try {
    const [accountRows] = await pool.query('SELECT id FROM inspector_accounts WHERE id = ?', [accountId]);
    if (!accountRows[0]) return sendError(res, 404, 'Inspector account not found.');

    const [result] = await pool.query(
      `INSERT INTO inspection_reports (
        account_id, company_name, inspector_name, vehicle_label, vehicle_reg_no,
        vin, mileage, transmission, fuel_type, inspected_at,
        checklist, images, overall_verdict, recommendation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        accountId,
        safeString(req.body?.companyName),
        safeString(req.body?.inspectorName),
        safeString(req.body?.vehicleLabel),
        safeString(req.body?.vehicleRegNo),
        safeString(req.body?.vin),
        safeString(req.body?.mileage),
        safeString(req.body?.transmission),
        safeString(req.body?.fuelType),
        inspectedAt,
        JSON.stringify(Array.isArray(req.body?.checklist) ? req.body.checklist : []),
        JSON.stringify(Array.isArray(req.body?.images) ? req.body.images : []),
        safeString(req.body?.overallVerdict) || 'Pending',
        safeString(req.body?.recommendation),
      ]
    );

    const [rows] = await pool.query('SELECT * FROM inspection_reports WHERE id = ?', [result.insertId]);
    res.status(201).json(normalizeInspectionReport(rows[0]));
  } catch {
    sendError(res, 500, 'Could not save inspection report.');
  }
});

app.get('/api/inspection-reports', requireAuth, requireRole('inspector'), async (req, res) => {
  const accountId = toInt(req.query.accountId);
  if (!accountId) return sendError(res, 400, 'accountId is required.');
  if (accountId !== toInt(req.auth.inspectorId)) return sendError(res, 403, 'You can only view your own reports.');
  try {
    const [rows] = await pool.query('SELECT * FROM inspection_reports WHERE account_id = ? ORDER BY inspected_at DESC', [accountId]);
    res.json(rows.map(normalizeInspectionReport));
  } catch {
    sendError(res, 500, 'Could not load inspection reports.');
  }
});

app.use((err, _req, res, _next) => {
  const message = err && typeof err.message === 'string' ? err.message : 'Unexpected server error.';
  sendError(res, 500, message);
});

async function bootstrap() {
  await initSchema();
  app.listen(port, () => {
    console.log(`Biltronix API running at http://localhost:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start API:', err);
  process.exit(1);
});
