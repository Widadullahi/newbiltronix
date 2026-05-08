
const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');

const ADMIN_ACCESS_TOKEN_KEY = 'biltronix_admin_access_token';
const ADMIN_REFRESH_TOKEN_KEY = 'biltronix_admin_refresh_token';
const INSPECTOR_ACCESS_TOKEN_KEY = 'biltronix_inspector_access_token';
const INSPECTOR_REFRESH_TOKEN_KEY = 'biltronix_inspector_refresh_token';

function toNumber(value, fallback = 0) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readStorage(key) {
  try {
    return window.localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function writeStorage(key, value) {
  try {
    if (!value) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function getAccessToken(auth) {
  return auth === 'admin' ? readStorage(ADMIN_ACCESS_TOKEN_KEY) : readStorage(INSPECTOR_ACCESS_TOKEN_KEY);
}

function getRefreshToken(auth) {
  return auth === 'admin' ? readStorage(ADMIN_REFRESH_TOKEN_KEY) : readStorage(INSPECTOR_REFRESH_TOKEN_KEY);
}

function setTokens(auth, accessToken, refreshToken) {
  if (auth === 'admin') {
    writeStorage(ADMIN_ACCESS_TOKEN_KEY, String(accessToken || ''));
    writeStorage(ADMIN_REFRESH_TOKEN_KEY, String(refreshToken || ''));
    return;
  }
  writeStorage(INSPECTOR_ACCESS_TOKEN_KEY, String(accessToken || ''));
  writeStorage(INSPECTOR_REFRESH_TOKEN_KEY, String(refreshToken || ''));
}

function clearTokens(auth) {
  if (auth === 'admin') {
    writeStorage(ADMIN_ACCESS_TOKEN_KEY, '');
    writeStorage(ADMIN_REFRESH_TOKEN_KEY, '');
    return;
  }
  writeStorage(INSPECTOR_ACCESS_TOKEN_KEY, '');
  writeStorage(INSPECTOR_REFRESH_TOKEN_KEY, '');
}

async function refreshAccessToken(auth) {
  const refreshToken = getRefreshToken(auth);
  if (!refreshToken) return false;

  const response = await fetch(`${apiBase}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: auth, refreshToken }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.accessToken || !payload?.refreshToken) {
    clearTokens(auth);
    return false;
  }

  setTokens(auth, payload.accessToken, payload.refreshToken);
  return true;
}

async function fileToDataUrl(file) {
  if (!file) return '';
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function filesToDataUrls(files) {
  const safeFiles = Array.isArray(files) ? files.filter(Boolean) : [];
  if (safeFiles.length === 0) return [];
  return Promise.all(safeFiles.map((file) => fileToDataUrl(file)));
}

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (options.auth) {
    const accessToken = getAccessToken(options.auth);
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${apiBase}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok && response.status === 401 && options.auth && !options.retrying) {
    const refreshed = await refreshAccessToken(options.auth);
    if (refreshed) {
      return api(path, { ...options, retrying: true });
    }
  }

  if (!response.ok) {
    const message = payload?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export const hasSanityConfig = true;
export const canWriteSanity = true;
export const sanityClient = null;

export function hasAdminSession() {
  return Boolean(readStorage(ADMIN_ACCESS_TOKEN_KEY) || readStorage(ADMIN_REFRESH_TOKEN_KEY));
}

export async function clearAdminSession() {
  const refreshToken = readStorage(ADMIN_REFRESH_TOKEN_KEY);
  clearTokens('admin');
  if (refreshToken) {
    await fetch(`${apiBase}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin', refreshToken }),
    }).catch(() => undefined);
  }
}

export async function clearInspectorSession() {
  const refreshToken = readStorage(INSPECTOR_REFRESH_TOKEN_KEY);
  clearTokens('inspector');
  if (refreshToken) {
    await fetch(`${apiBase}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'inspector', refreshToken }),
    }).catch(() => undefined);
  }
}

export async function adminLogin(email, password) {
  const result = await api('/admin/login', {
    method: 'POST',
    body: {
      email: String(email || '').trim().toLowerCase(),
      password: String(password || ''),
    },
  });
  setTokens('admin', result?.accessToken, result?.refreshToken);
  return Boolean(result?.success && result?.accessToken && result?.refreshToken);
}

export async function fetchAdminDashboardData() {
  const data = await api('/dashboard', { auth: 'admin' });
  return {
    bookings: Array.isArray(data?.bookings) ? data.bookings : [],
    orders: Array.isArray(data?.orders) ? data.orders : [],
    inventory: Array.isArray(data?.inventory) ? data.inventory : [],
  };
}

export async function fetchCarTips(limit = 6) {
  const tips = await api(`/car-tips?limit=${encodeURIComponent(limit)}`);
  return Array.isArray(tips) ? tips : [];
}

export async function createCarTip(payload) {
  const imageUrl = payload.imageFile ? await fileToDataUrl(payload.imageFile) : '';
  return api('/car-tips', {
    method: 'POST',
    auth: 'admin',
    body: { title: payload.title || '', body: payload.body || '', category: payload.category || 'General', imageUrl, order: toNumber(payload.order, 999) },
  });
}

export async function updateCarTip(tipId, updates) {
  const imageUrl = updates.imageFile ? await fileToDataUrl(updates.imageFile) : updates.imageUrl || '';
  return api(`/car-tips/${encodeURIComponent(tipId)}`, {
    method: 'PATCH',
    auth: 'admin',
    body: { title: updates.title || '', body: updates.body || '', category: updates.category || 'General', imageUrl, order: toNumber(updates.order, 999) },
  });
}

export async function deleteCarTip(tipId) {
  await api(`/car-tips/${encodeURIComponent(tipId)}`, { method: 'DELETE', auth: 'admin' });
  return String(tipId);
}

export async function fetchStoreHighlights(limit = 6) {
  const highlights = await api(`/store-highlights?limit=${encodeURIComponent(limit)}`);
  return Array.isArray(highlights) ? highlights : [];
}

export async function fetchStockItems(limit = 300) {
  const items = await api(`/stock-items?limit=${encodeURIComponent(limit)}`);
  return Array.isArray(items) ? items : [];
}

export async function createStockItem(payload) {
  const [primaryImageUrl, featureImageUrl, otherImageUrls] = await Promise.all([
    fileToDataUrl(payload.primaryImageFile),
    fileToDataUrl(payload.featureImageFile),
    filesToDataUrls(payload.otherImageFiles),
  ]);

  return api('/stock-items', {
    method: 'POST',
    auth: 'admin',
    body: {
      name: payload.name,
      description: payload.description || '',
      primaryImageUrl,
      featureImageUrl,
      otherImageUrls,
      soldOut: Boolean(payload.soldOut),
      category: payload.category,
      stock: toNumber(payload.stock),
      sold: toNumber(payload.sold),
      unitPrice: toNumber(payload.unitPrice),
      make: payload.make || '',
      model: payload.model || '',
      year: toNumber(payload.year),
      condition: payload.condition || '',
      transmission: payload.transmission || '',
      fuelType: payload.fuelType || '',
    },
  });
}

export async function updateStockItem(itemId, updates) {
  return api(`/stock-items/${encodeURIComponent(itemId)}`, { method: 'PATCH', auth: 'admin', body: { ...updates } });
}

export async function setStockItemSoldStatus(itemId, soldOut) {
  return api(`/stock-items/${encodeURIComponent(itemId)}/sold-status`, { method: 'PATCH', auth: 'admin', body: { soldOut: Boolean(soldOut) } });
}

export async function deleteStockItem(itemId) {
  await api(`/stock-items/${encodeURIComponent(itemId)}`, { method: 'DELETE', auth: 'admin' });
  return String(itemId);
}

export async function createBookingRequest(payload) {
  return api('/bookings', {
    method: 'POST',
    body: {
      customer: payload.customer,
      service: payload.service,
      date: payload.date,
      whatsappNumber: payload.whatsappNumber || '',
      vehicle: payload.vehicle || '',
      email: payload.email || '',
      note: payload.note || '',
    },
  });
}

export async function createInspectorAccount(payload) {
  const response = await api('/inspectors/register', {
    method: 'POST',
    body: {
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      phone: payload.phone,
      companyName: payload.companyName,
      companyAddress: payload.companyAddress,
      signatureDataUrl: payload.signatureDataUrl || '',
      companyLogoDataUrl: payload.companyLogoDataUrl || '',
    },
  });
  setTokens('inspector', response?.accessToken, response?.refreshToken);
  return response?.account || null;
}

export async function loginInspectorAccount(email, password) {
  const response = await api('/inspectors/login', {
    method: 'POST',
    body: { email, password },
  });
  setTokens('inspector', response?.accessToken, response?.refreshToken);
  return response?.account || null;
}

export async function requestInspectorPasswordReset(email) {
  return api('/inspectors/password-reset/request', {
    method: 'POST',
    body: { email: String(email || '').trim().toLowerCase() },
  });
}

export async function confirmInspectorPasswordReset(email, otp, newPassword) {
  return api('/inspectors/password-reset/confirm', {
    method: 'POST',
    body: {
      email: String(email || '').trim().toLowerCase(),
      otp: String(otp || '').trim(),
      newPassword: String(newPassword || ''),
    },
  });
}

export async function updateInspectorAccount(accountId, updates) {
  return api(`/inspectors/${encodeURIComponent(accountId)}`, {
    method: 'PATCH',
    auth: 'inspector',
    body: {
      fullName: updates.fullName || '',
      email: updates.email || '',
      phone: updates.phone || '',
      companyName: updates.companyName || '',
      companyAddress: updates.companyAddress || '',
      signatureDataUrl: updates.signatureDataUrl || '',
      companyLogoDataUrl: updates.companyLogoDataUrl || '',
    },
  });
}

export async function createInspectionReport(payload) {
  return api('/inspection-reports', {
    method: 'POST',
    auth: 'inspector',
    body: {
      accountId: payload.accountId,
      companyName: payload.companyName,
      inspectorName: payload.inspectorName,
      vehicleLabel: payload.vehicleLabel,
      vehicleRegNo: payload.vehicleRegNo || '',
      vin: payload.vin || '',
      mileage: payload.mileage || '',
      transmission: payload.transmission || '',
      fuelType: payload.fuelType || '',
      inspectedAt: payload.inspectedAt,
      checklist: payload.checklist || [],
      images: payload.images || [],
      overallVerdict: payload.overallVerdict || 'Pending',
      recommendation: payload.recommendation || '',
    },
  });
}

export async function fetchInspectionReportsByAccount(accountId) {
  const docs = await api(`/inspection-reports?accountId=${encodeURIComponent(accountId)}`, { auth: 'inspector' });
  return Array.isArray(docs) ? docs : [];
}
