import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminLogin,
  clearAdminSession,
  createCarTip,
  createStockItem,
  deleteCarTip,
  deleteStockItem,
  fetchAdminDashboardData,
  fetchCarTips,
  hasAdminSession,
  fetchStockItems,
  setStockItemSoldStatus,
  updateCarTip,
} from '../lib/sanityClient.js';
import { OTHER_OPTION, VEHICLE_MAKES, VEHICLE_MODELS_BY_MAKE } from '../lib/vehicleOptions.js';

function toSlug(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const STOCK_CATEGORIES = [
  { panel: 'vehicle', value: 'vehicle', label: 'Vehicle', addLabel: 'Add Vehicle' },
  { panel: 'car-parts', value: 'car-parts', label: 'Car Parts', addLabel: 'Add Car Part' },
  { panel: 'accessories', value: 'accessories', label: 'Accessories', addLabel: 'Add Accessories' },
];

const VEHICLE_CONDITIONS = ['New', 'Foreign Used', 'Nigerian Used'];
const VEHICLE_TRANSMISSIONS = ['Automatic', 'Manual'];
const VEHICLE_FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const TIP_CATEGORIES = ['General', 'Maintenance', 'Safety', 'Engine Care', 'Performance', 'Buying Guide'];

const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

export default function AdminDashboardPage() {
  const [activePanel, setActivePanel] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasAdminSession());
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState('all');
  const [bookingQuery, setBookingQuery] = useState('');
  const [orderChannel, setOrderChannel] = useState('all');
  const [orderQuery, setOrderQuery] = useState('');
  const [dashboardData, setDashboardData] = useState({ bookings: [], orders: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockItems, setStockItems] = useState([]);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState('');
  const [stockMessage, setStockMessage] = useState('');
  const [savingItemId, setSavingItemId] = useState('');
  const [carTips, setCarTips] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(true);
  const [tipsError, setTipsError] = useState('');
  const [tipsMessage, setTipsMessage] = useState('');
  const [savingTipId, setSavingTipId] = useState('');
  const [newTipTitle, setNewTipTitle] = useState('');
  const [newTipBody, setNewTipBody] = useState('');
  const [newTipCategory, setNewTipCategory] = useState('General');
  const [newTipImageFile, setNewTipImageFile] = useState(null);
  const [editingTipId, setEditingTipId] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemUnitPrice, setNewItemUnitPrice] = useState('');
  const [newPrimaryImageFile, setNewPrimaryImageFile] = useState(null);
  const [newOtherImageFiles, setNewOtherImageFiles] = useState([]);
  const [newVehicleMake, setNewVehicleMake] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [customNewVehicleMake, setCustomNewVehicleMake] = useState('');
  const [customNewVehicleModel, setCustomNewVehicleModel] = useState('');
  const [newVehicleDescription, setNewVehicleDescription] = useState('');
  const [newVehicleYear, setNewVehicleYear] = useState(String(new Date().getFullYear()));
  const [newVehicleCondition, setNewVehicleCondition] = useState(VEHICLE_CONDITIONS[0]);
  const [newVehicleTransmission, setNewVehicleTransmission] = useState(VEHICLE_TRANSMISSIONS[0]);
  const [newVehicleFuelType, setNewVehicleFuelType] = useState(VEHICLE_FUEL_TYPES[0]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showCarPartForm, setShowCarPartForm] = useState(false);
  const [showAccessoriesForm, setShowAccessoriesForm] = useState(false);
  const [showTipForm, setShowTipForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: '',
    id: '',
    label: '',
    processing: false,
  });

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await fetchAdminDashboardData();
      setDashboardData(data);
    } catch (loadError) {
      setDashboardData({ bookings: [], orders: [] });
      setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard data from API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadDashboardData();
  }, [isAuthenticated]);

  const loadStockItems = async () => {
    setStockLoading(true);
    setStockError('');

    try {
      const items = await fetchStockItems();
      setStockItems(items);
    } catch (loadError) {
      setStockItems([]);
      setStockError(loadError instanceof Error ? loadError.message : 'Failed to load items.');
    } finally {
      setStockLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadStockItems();
  }, [isAuthenticated]);

  const loadCarTips = async () => {
    setTipsLoading(true);
    setTipsError('');
    try {
      const tips = await fetchCarTips(200);
      setCarTips(tips);
    } catch (loadError) {
      setCarTips([]);
      setTipsError(loadError instanceof Error ? loadError.message : 'Failed to load car tips.');
    } finally {
      setTipsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadCarTips();
  }, [isAuthenticated]);

  const bookings = dashboardData.bookings;
  const orders = dashboardData.orders;

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const statusMatch = bookingStatus === 'all' || toSlug(booking.status) === bookingStatus;
      const query = bookingQuery.trim().toLowerCase();
      const queryMatch =
        !query ||
        booking.id.toLowerCase().includes(query) ||
        booking.customer.toLowerCase().includes(query) ||
        booking.service.toLowerCase().includes(query);
      return statusMatch && queryMatch;
    });
  }, [bookings, bookingStatus, bookingQuery]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const channelMatch = orderChannel === 'all' || order.channel.toLowerCase() === orderChannel;
      const query = orderQuery.trim().toLowerCase();
      const queryMatch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.item.toLowerCase().includes(query);
      return channelMatch && queryMatch;
    });
  }, [orders, orderChannel, orderQuery]);

  const metrics = useMemo(() => {
    const vehicleCount = stockItems.filter((item) => item.category === 'vehicle').length;
    const carPartCount = stockItems.filter((item) => item.category === 'car-parts').length;
    const accessoriesCount = stockItems.filter((item) => item.category === 'accessories').length;

    return [
      { label: 'Total Vehicles', value: String(vehicleCount), icon: 'fa-car-side' },
      { label: 'Total Car Parts', value: String(carPartCount), icon: 'fa-cogs' },
      { label: 'Total Accessories', value: String(accessoriesCount), icon: 'fa-toolbox' },
    ];
  }, [stockItems]);

  const revenueByChannel = useMemo(() => {
    const totals = orders.reduce((acc, order) => {
      const key = order.channel;
      const next = (acc[key] || 0) + order.amountValue;
      return { ...acc, [key]: next };
    }, {});

    const overall = Object.values(totals).reduce((sum, value) => sum + value, 0);
    return Object.entries(totals)
      .map(([channel, value]) => ({
        channel,
        value,
        percentage: overall ? Math.round((value / overall) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [orders]);

  const bookingStatuses = useMemo(() => {
    const unique = Array.from(new Set(bookings.map((booking) => booking.status))).filter(Boolean);
    return unique;
  }, [bookings]);

  const orderChannels = useMemo(() => {
    const unique = Array.from(new Set(orders.map((order) => order.channel))).filter(Boolean);
    return unique;
  }, [orders]);

  const activeStockCategory = useMemo(() => {
    const found = STOCK_CATEGORIES.find((category) => category.panel === activePanel);
    return found ? found.value : '';
  }, [activePanel]);

  const stockItemsByCategory = useMemo(() => {
    return stockItems.filter((item) => item.category === activeStockCategory);
  }, [activeStockCategory, stockItems]);

  const activeStockMeta = useMemo(() => {
    return STOCK_CATEGORIES.find((item) => item.panel === activePanel) || null;
  }, [activePanel]);
  const isTipSaving = savingTipId === 'new' || (Boolean(editingTipId) && savingTipId === editingTipId);

  const vehicleStats = useMemo(() => {
    const vehicles = stockItems.filter((item) => item.category === 'vehicle');
    const newCount = vehicles.filter((item) => item.condition === 'New').length;
    const foreignUsedCount = vehicles.filter((item) => item.condition === 'Foreign Used').length;
    const nigerianUsedCount = vehicles.filter((item) => item.condition === 'Nigerian Used').length;
    return { totalVehicles: vehicles.length, newCount, foreignUsedCount, nigerianUsedCount };
  }, [stockItems]);
  const adminVehicleModelOptions = useMemo(() => {
    if (!newVehicleMake || newVehicleMake === OTHER_OPTION) return [];
    return VEHICLE_MODELS_BY_MAKE[newVehicleMake] || [];
  }, [newVehicleMake]);

  const addStockItem = async () => {
    if (!activeStockCategory) return;

    setStockError('');
    setStockMessage('');
    setSavingItemId('new');
    try {
      const hasAnyImage = Boolean(newPrimaryImageFile || (Array.isArray(newOtherImageFiles) && newOtherImageFiles.length > 0));
      if (!hasAnyImage) {
        throw new Error('Please upload at least one image (Primary or Other Images).');
      }

      let payload;
      if (activeStockCategory === 'vehicle') {
        const resolvedVehicleMake = newVehicleMake === OTHER_OPTION ? customNewVehicleMake.trim() : newVehicleMake.trim();
        const resolvedVehicleModel = newVehicleModel === OTHER_OPTION ? customNewVehicleModel.trim() : newVehicleModel.trim();

        if (!resolvedVehicleMake || !resolvedVehicleModel) {
          throw new Error('Vehicle make and model are required.');
        }
        const vehicleName = `${newVehicleYear} ${resolvedVehicleMake} ${resolvedVehicleModel}`.trim();
        payload = {
          name: vehicleName,
          description: newVehicleDescription.trim(),
          primaryImageFile: newPrimaryImageFile,
          otherImageFiles: newOtherImageFiles,
          soldOut: false,
          category: activeStockCategory,
          unitPrice: newItemUnitPrice,
          make: resolvedVehicleMake,
          model: resolvedVehicleModel,
          year: newVehicleYear,
          condition: newVehicleCondition,
          transmission: newVehicleTransmission,
          fuelType: newVehicleFuelType,
        };
      } else {
        if (!newItemName.trim()) {
          throw new Error('Item name is required.');
        }
        payload = {
          name: newItemName.trim(),
          description: newItemDescription.trim(),
          primaryImageFile: newPrimaryImageFile,
          otherImageFiles: newOtherImageFiles,
          soldOut: false,
          category: activeStockCategory,
          unitPrice: newItemUnitPrice,
        };
      }

      const created = await createStockItem({
        ...payload,
      });
      setStockItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewItemName('');
      setNewItemDescription('');
      setNewItemUnitPrice('');
      setNewPrimaryImageFile(null);
      setNewOtherImageFiles([]);
      setNewVehicleMake('');
      setNewVehicleModel('');
      setCustomNewVehicleMake('');
      setCustomNewVehicleModel('');
      setNewVehicleDescription('');
      setNewVehicleYear(String(new Date().getFullYear()));
      setNewVehicleCondition(VEHICLE_CONDITIONS[0]);
      setNewVehicleTransmission(VEHICLE_TRANSMISSIONS[0]);
      setNewVehicleFuelType(VEHICLE_FUEL_TYPES[0]);
      setShowVehicleForm(false);
      setShowCarPartForm(false);
      setShowAccessoriesForm(false);
      setStockMessage(`${created.name} added.`);
    } catch (createError) {
      const fallbackMessage = 'Could not add item.';
      const rawMessage = createError instanceof Error ? createError.message : fallbackMessage;
      setStockError(rawMessage || fallbackMessage);
    } finally {
      setSavingItemId('');
    }
  };

  const toggleSoldStatus = async (item) => {
    setStockError('');
    setStockMessage('');
    setSavingItemId(item._id);
    try {
      const updated = await setStockItemSoldStatus(item._id, !item.soldOut);
      setStockItems((prev) => prev.map((entry) => (entry._id === updated._id ? updated : entry)));
      setStockMessage(`${updated.name} marked as ${updated.soldOut ? 'Sold' : 'Available'}.`);
    } catch (toggleError) {
      setStockError(toggleError instanceof Error ? toggleError.message : 'Could not update sold status.');
    } finally {
      setSavingItemId('');
    }
  };

  const removeItem = async (itemId, itemName) => {
    setStockError('');
    setStockMessage('');
    setSavingItemId(itemId);
    try {
      await deleteStockItem(itemId);
      setStockItems((prev) => prev.filter((entry) => entry._id !== itemId));
      setStockMessage(`${itemName} deleted.`);
    } catch (deleteError) {
      setStockError(deleteError instanceof Error ? deleteError.message : 'Could not delete item.');
    } finally {
      setSavingItemId('');
    }
  };

  const addCarTip = async () => {
    if (!newTipTitle.trim() || !newTipBody.trim()) {
      setTipsError('Tip title and content are required.');
      return;
    }

    setTipsError('');
    setTipsMessage('');
    setSavingTipId('new');
    try {
      const created = await createCarTip({
        title: newTipTitle.trim(),
        body: newTipBody.trim(),
        category: newTipCategory.trim() || 'General',
        imageFile: newTipImageFile,
      });
      setCarTips((prev) => [...prev, created].sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''))));
      setNewTipTitle('');
      setNewTipBody('');
      setNewTipCategory('General');
      setNewTipImageFile(null);
      setShowTipForm(false);
      setTipsMessage('Car tip added.');
    } catch (saveError) {
      setTipsError(saveError instanceof Error ? saveError.message : 'Could not add car tip.');
    } finally {
      setSavingTipId('');
    }
  };

  const saveEditingTip = async () => {
    if (!editingTipId) return;
    if (!newTipTitle.trim() || !newTipBody.trim()) {
      setTipsError('Tip title and content are required.');
      return;
    }
    const existingTip = carTips.find((tip) => tip._id === editingTipId);
    if (!existingTip) return;
    setTipsError('');
    setTipsMessage('');
    setSavingTipId(editingTipId);
    try {
      const updated = await updateCarTip(editingTipId, {
        ...existingTip,
        title: newTipTitle.trim(),
        body: newTipBody.trim(),
        category: newTipCategory.trim() || 'General',
        imageFile: newTipImageFile,
      });
      setCarTips((prev) => prev.map((entry) => (entry._id === updated._id ? updated : entry)));
      setTipsMessage('Car tip updated.');
      setEditingTipId('');
      setNewTipTitle('');
      setNewTipBody('');
      setNewTipCategory('General');
      setNewTipImageFile(null);
      setShowTipForm(false);
    } catch (saveError) {
      setTipsError(saveError instanceof Error ? saveError.message : 'Could not update car tip.');
    } finally {
      setSavingTipId('');
    }
  };

  const removeCarTip = async (tipId) => {
    setTipsError('');
    setTipsMessage('');
    setSavingTipId(tipId);
    try {
      await deleteCarTip(tipId);
      setCarTips((prev) => prev.filter((entry) => entry._id !== tipId));
      setTipsMessage('Car tip deleted.');
    } catch (deleteError) {
      setTipsError(deleteError instanceof Error ? deleteError.message : 'Could not delete car tip.');
    } finally {
      setSavingTipId('');
    }
  };

  const openDeleteModal = (type, id, label) => {
    setDeleteModal({
      open: true,
      type,
      id,
      label,
      processing: false,
    });
  };

  const closeDeleteModal = () => {
    if (deleteModal.processing) return;
    setDeleteModal({
      open: false,
      type: '',
      id: '',
      label: '',
      processing: false,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id || !deleteModal.type || deleteModal.processing) return;

    setDeleteModal((prev) => ({ ...prev, processing: true }));
    try {
      if (deleteModal.type === 'stock') {
        await removeItem(deleteModal.id, deleteModal.label);
      } else if (deleteModal.type === 'tip') {
        await removeCarTip(deleteModal.id);
      }
      setDeleteModal({
        open: false,
        type: '',
        id: '',
        label: '',
        processing: false,
      });
    } catch {
      setDeleteModal((prev) => ({ ...prev, processing: false }));
    }
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setLoginError('');
    try {
      const ok = await adminLogin(loginEmail, loginPassword);
      if (!ok) {
        setLoginError('Invalid admin email or password.');
        return;
      }
      setIsAuthenticated(true);
      setLoginPassword('');
    } catch (loginError) {
      setLoginError(loginError instanceof Error ? loginError.message : 'Could not log in.');
    }
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
  };

  const handlePanelChange = (panel) => {
    setActivePanel(panel);
    if (panel !== 'vehicle') setShowVehicleForm(false);
    if (panel !== 'car-parts') setShowCarPartForm(false);
    if (panel !== 'accessories') setShowAccessoriesForm(false);
    if (panel !== 'car-tips') setShowTipForm(false);
    if (window.matchMedia('(max-width: 960px)').matches) {
      setSidebarOpen(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className='mx-auto mt-[8vh] min-h-screen max-w-[420px] bg-glass-bg px-4'>
        <section className='mb-6 rounded-glass border border-glass-border bg-glass-surface p-6 shadow-glass backdrop-blur-glass [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text-primary'>
          <h2>Admin Login</h2>
          <p>Use your admin email and password to access the dashboard.</p>
          <form className='flex flex-col gap-4' onSubmit={handleAdminLogin}>
            <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
              <label htmlFor='admin-email'>Email</label>
              <input
                id='admin-email'
                type='email'
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder='Enter admin email'
                required
              />
            </div>
            <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
              <label htmlFor='admin-password'>Password</label>
              <input
                id='admin-password'
                type='password'
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder='Enter admin password'
                required
              />
            </div>
            {loginError && <p className='mt-2 text-sm text-error'>{loginError}</p>}
            <button className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0' type='submit'>Login</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className='flex min-h-screen bg-glass-bg'>
      <aside className={`fixed z-50 h-screen w-[260px] translate-x-0 overflow-y-auto border-r border-glass-border bg-glass-surface px-4 py-6 backdrop-blur-2xl transition-transform duration-300 max-[960px]:-translate-x-full ${sidebarOpen ? 'max-[960px]:translate-x-0' : ''}`}>
        <div className='mb-8 px-3 font-heading text-xl font-bold text-text-primary'>Biltronix Admin</div>
        <button
          className={`mb-1 flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 px-4 py-3 text-left text-[0.9375rem] font-medium transition [&_i]:w-5 [&_i]:text-center ${activePanel === 'overview' ? 'bg-primary-50 text-primary' : 'bg-transparent text-text-secondary hover:bg-slate-100 hover:text-text-primary'}`}
          onClick={() => handlePanelChange('overview')}
        >
          <i className='fas fa-gauge-high' /> Overview
        </button>
        <button
          className={`mb-1 flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 px-4 py-3 text-left text-[0.9375rem] font-medium transition [&_i]:w-5 [&_i]:text-center ${activePanel === 'vehicle' ? 'bg-primary-50 text-primary' : 'bg-transparent text-text-secondary hover:bg-slate-100 hover:text-text-primary'}`}
          onClick={() => handlePanelChange('vehicle')}
        >
          <i className='fas fa-car-side' /> Vehicle
        </button>
        <button
          className={`mb-1 flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 px-4 py-3 text-left text-[0.9375rem] font-medium transition [&_i]:w-5 [&_i]:text-center ${activePanel === 'car-parts' ? 'bg-primary-50 text-primary' : 'bg-transparent text-text-secondary hover:bg-slate-100 hover:text-text-primary'}`}
          onClick={() => handlePanelChange('car-parts')}
        >
          <i className='fas fa-cogs' /> Car Parts
        </button>
        <button
          className={`mb-1 flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 px-4 py-3 text-left text-[0.9375rem] font-medium transition [&_i]:w-5 [&_i]:text-center ${activePanel === 'accessories' ? 'bg-primary-50 text-primary' : 'bg-transparent text-text-secondary hover:bg-slate-100 hover:text-text-primary'}`}
          onClick={() => handlePanelChange('accessories')}
        >
          <i className='fas fa-toolbox' /> Accessories
        </button>
        <button
          className={`mb-1 flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 px-4 py-3 text-left text-[0.9375rem] font-medium transition [&_i]:w-5 [&_i]:text-center ${activePanel === 'car-tips' ? 'bg-primary-50 text-primary' : 'bg-transparent text-text-secondary hover:bg-slate-100 hover:text-text-primary'}`}
          onClick={() => handlePanelChange('car-tips')}
        >
          <i className='fas fa-lightbulb' /> Car Tips
        </button>
        <div className='mt-auto border-t border-slate-200 pt-6'>
          <Link className='mb-2 block rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary no-underline transition hover:bg-slate-100 hover:text-text-primary' to='/' onClick={() => setSidebarOpen(false)}>
            View Home
          </Link>
          <Link className='mb-2 block rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary no-underline transition hover:bg-slate-100 hover:text-text-primary' to='/sales' onClick={() => setSidebarOpen(false)}>
            View Store
          </Link>
        </div>
      </aside>
      {sidebarOpen && <button className='fixed inset-0 z-40 bg-slate-950/30 min-[961px]:hidden' onClick={() => setSidebarOpen(false)} aria-label='Close navigation' />}

      <main className='min-h-screen bg-glass-bg p-8 max-[960px]:p-5'>
        <header className='mb-8 [&_h1]:m-0 [&_h1]:flex-1 [&_h1]:text-[1.75rem] [&_h1]:font-bold [&_h1]:text-text-primary [&_p]:m-0 [&_p]:text-[0.9375rem] [&_p]:text-text-secondary'>
          <div className='mb-2 flex items-center gap-4'>
            <button
              className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-glass-border bg-glass-surface text-text-secondary transition hover:bg-slate-100 hover:text-text-primary'
              type='button'
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            >
              <i className='fas fa-bars' />
            </button>
            <h1>Operations Dashboard</h1>
            <button className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0' type='button' onClick={handleAdminLogout}>
              Logout
            </button>
          </div>
          <p>Track bookings, orders, and item listings from one place.</p>
          {error && <p className='mt-2 text-sm text-error'>{error}</p>}
        </header>

        {activePanel === 'overview' && (
          <>
            <section className='mb-6 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 max-[640px]:grid-cols-1'>
              {metrics.map((metric) => (
                <article key={metric.label} className='mb-6 flex items-center gap-4 rounded-glass border border-glass-border bg-glass-surface p-6 shadow-glass backdrop-blur-glass'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-xl text-primary'>
                    <i className={`fas ${metric.icon}`} />
                  </div>
                  <div>
                    <div className='text-[1.75rem] font-bold text-text-primary'>{metric.value}</div>
                    <div className='text-sm font-medium text-text-muted'>{metric.label}</div>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}

        {activePanel === 'bookings' && (
          <section className='mb-6 rounded-glass border border-glass-border bg-glass-surface p-6 shadow-glass backdrop-blur-glass [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text-primary'>
            <h2>Recent Bookings</h2>
            <div className='mb-5 flex gap-3 max-[640px]:flex-col [&_input]:flex-1 [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:text-sm [&_input]:outline-none [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-3.5 [&_select]:py-2.5 [&_select]:text-sm [&_select]:outline-none'>
              <input
                type='search'
                value={bookingQuery}
                onChange={(event) => setBookingQuery(event.target.value)}
                placeholder='Search by ID, customer, or service'
              />
              <select value={bookingStatus} onChange={(event) => setBookingStatus(event.target.value)}>
                <option value='all'>All Statuses</option>
                {bookingStatuses.map((status) => (
                  <option key={status} value={toSlug(status)}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <table className='w-full border-separate border-spacing-0 [&_th]:border-b [&_th]:border-slate-200 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-text-muted [&_td]:border-b [&_td]:border-slate-100 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-sm [&_td]:text-text-primary [&_tbody_tr:hover_td]:bg-slate-50'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.customer}</td>
                    <td>{booking.service}</td>
                    <td>{formatDate(booking.date)}</td>
                    <td>
                      <span className='inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary'>{booking.status}</span>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className='py-12 text-center text-text-muted'>
                      No bookings found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {activePanel === 'orders' && (
          <section className='mb-6 rounded-glass border border-glass-border bg-glass-surface p-6 shadow-glass backdrop-blur-glass [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text-primary'>
            <h2>Latest Orders</h2>
            <div className='mb-5 flex gap-3 max-[640px]:flex-col [&_input]:flex-1 [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:text-sm [&_input]:outline-none [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-3.5 [&_select]:py-2.5 [&_select]:text-sm [&_select]:outline-none'>
              <input
                type='search'
                value={orderQuery}
                onChange={(event) => setOrderQuery(event.target.value)}
                placeholder='Search by order, customer, or item'
              />
              <select value={orderChannel} onChange={(event) => setOrderChannel(event.target.value)}>
                <option value='all'>All Channels</option>
                {orderChannels.map((channel) => (
                  <option key={channel} value={channel.toLowerCase()}>
                    {channel}
                  </option>
                ))}
              </select>
            </div>
            <table className='w-full border-separate border-spacing-0 [&_th]:border-b [&_th]:border-slate-200 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-text-muted [&_td]:border-b [&_td]:border-slate-100 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-sm [&_td]:text-text-primary [&_tbody_tr:hover_td]:bg-slate-50'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Channel</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.item}</td>
                    <td>{order.customer}</td>
                    <td>{order.amountLabel}</td>
                    <td>{order.channel}</td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className='py-12 text-center text-text-muted'>
                      No orders found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {(activePanel === 'vehicle' || activePanel === 'car-parts' || activePanel === 'accessories') && (
          <section className='mb-6 rounded-glass border border-glass-border bg-glass-surface p-6 shadow-glass backdrop-blur-glass [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text-primary'>
            <h2>{activeStockMeta?.label} Manager</h2>
            <p className='mb-5 text-[0.9375rem] text-text-secondary'>
              {activePanel === 'vehicle'
                ? 'Add vehicles.'
                : activePanel === 'car-parts'
                ? 'Add car parts.'
                : 'Add accessories.'}
            </p>

            {activePanel === 'vehicle' ? (
              <>
                <div className='mb-5 flex gap-3 max-[640px]:flex-col'>
                  <button
                    className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'
                    type='button'
                    onClick={() => {
                      setNewPrimaryImageFile(null);
                      setNewOtherImageFiles([]);
                      setShowVehicleForm(true);
                      setShowCarPartForm(false);
                      setShowAccessoriesForm(false);
                    }}
                    disabled={savingItemId === 'new'}
                  >
                    Add Vehicle
                  </button>
                  <button className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0' type='button' onClick={loadStockItems} disabled={stockLoading}>
                    {stockLoading ? 'Refreshing...' : 'Refresh List'}
                  </button>
                </div>
                <section className='mb-6 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 max-[640px]:grid-cols-1'>
                  <article className='mb-6 flex items-center gap-4 rounded-glass border border-glass-border bg-glass-surface p-6 shadow-glass backdrop-blur-glass'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-xl text-primary'>
                      <i className='fas fa-car-side' />
                    </div>
                    <div>
                      <div className='text-[1.75rem] font-bold text-text-primary'>{vehicleStats.totalVehicles}</div>
                      <div className='text-sm font-medium text-text-muted'>Number of Vehicles</div>
                    </div>
                  </article>
                  <article className='mb-6 flex items-center gap-4 rounded-glass border border-glass-border bg-glass-surface p-6 shadow-glass backdrop-blur-glass'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-xl text-primary'>
                      <i className='fas fa-certificate' />
                    </div>
                    <div>
                      <div className='text-[1.75rem] font-bold text-text-primary'>{vehicleStats.newCount}</div>
                      <div className='text-sm font-medium text-text-muted'>New</div>
                    </div>
                  </article>
                  <article className='mb-6 flex items-center gap-4 rounded-glass border border-glass-border bg-glass-surface p-6 shadow-glass backdrop-blur-glass'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-xl text-primary'>
                      <i className='fas fa-globe-africa' />
                    </div>
                    <div>
                      <div className='text-[1.75rem] font-bold text-text-primary'>{vehicleStats.foreignUsedCount}</div>
                      <div className='text-sm font-medium text-text-muted'>Foreign Used</div>
                    </div>
                  </article>
                  <article className='mb-6 flex items-center gap-4 rounded-glass border border-glass-border bg-glass-surface p-6 shadow-glass backdrop-blur-glass'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-xl text-primary'>
                      <i className='fas fa-flag' />
                    </div>
                    <div>
                      <div className='text-[1.75rem] font-bold text-text-primary'>{vehicleStats.nigerianUsedCount}</div>
                      <div className='text-sm font-medium text-text-muted'>Nigerian Used</div>
                    </div>
                  </article>
                </section>
              </>
            ) : (
              <div className='mb-5 flex gap-3 max-[640px]:flex-col'>
                <button
                  className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'
                  type='button'
                  onClick={() => {
                    setNewPrimaryImageFile(null);
                    setNewOtherImageFiles([]);
                    if (activePanel === 'car-parts') {
                      setShowCarPartForm(true);
                      setShowAccessoriesForm(false);
                    } else {
                      setShowAccessoriesForm(true);
                      setShowCarPartForm(false);
                    }
                    setShowVehicleForm(false);
                  }}
                  disabled={savingItemId === 'new'}
                >
                  {activeStockMeta?.addLabel || 'Add Item'}
                </button>
                <button className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0' type='button' onClick={loadStockItems} disabled={stockLoading}>
                  {stockLoading ? 'Refreshing...' : 'Refresh List'}
                </button>
              </div>
            )}

            {stockMessage && <p className='mt-2 text-sm text-success'>{stockMessage}</p>}
            {stockError && <p className='mt-2 text-sm text-error'>{stockError}</p>}

            <table className='w-full border-separate border-spacing-0 [&_th]:border-b [&_th]:border-slate-200 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-text-muted [&_td]:border-b [&_td]:border-slate-100 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-sm [&_td]:text-text-primary [&_tbody_tr:hover_td]:bg-slate-50'>
              <thead>
                {activePanel === 'vehicle' ? (
                  <tr>
                    <th>Vehicle</th>
                    <th>Description</th>
                    <th>Condition</th>
                    <th>Transmission</th>
                    <th>Fuel</th>
                    <th>Status</th>
                    <th>Unit Price</th>
                    <th>Action</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Item</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Unit Price</th>
                    <th>Action</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {stockItemsByCategory.map((item) => (
                  activePanel === 'vehicle' ? (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.description || '-'}</td>
                      <td>{item.condition || '-'}</td>
                      <td>{item.transmission || '-'}</td>
                      <td>{item.fuelType || '-'}</td>
                      <td>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${item.soldOut ? 'bg-error-light text-error' : 'bg-success-light text-success'}`}>{item.soldOut ? 'Sold' : 'Available'}</span>
                      </td>
                      <td>{naira.format(item.unitPrice || 0)}</td>
                      <td>
                        <div className='flex gap-2 max-[640px]:flex-col'>
                          <button className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0' type='button' onClick={() => toggleSoldStatus(item)} disabled={savingItemId === item._id}>
                            {savingItemId === item._id ? 'Saving...' : item.soldOut ? 'Mark Available' : 'Mark Sold'}
                          </button>
                          <button
                            className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-error px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(239,68,68,0.2)] transition hover:-translate-y-px hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'
                            type='button'
                            onClick={() => openDeleteModal('stock', item._id, item.name || 'this item')}
                            disabled={savingItemId === item._id}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.description || '-'}</td>
                      <td>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${item.soldOut ? 'bg-error-light text-error' : 'bg-success-light text-success'}`}>{item.soldOut ? 'Sold' : 'Available'}</span>
                      </td>
                      <td>{naira.format(item.unitPrice || 0)}</td>
                      <td>
                        <div className='flex gap-2 max-[640px]:flex-col'>
                          <button className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0' type='button' onClick={() => toggleSoldStatus(item)} disabled={savingItemId === item._id}>
                            {savingItemId === item._id ? 'Saving...' : item.soldOut ? 'Mark Available' : 'Mark Sold'}
                          </button>
                          <button
                            className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-error px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(239,68,68,0.2)] transition hover:-translate-y-px hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'
                            type='button'
                            onClick={() => openDeleteModal('stock', item._id, item.name || 'this item')}
                            disabled={savingItemId === item._id}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
                {stockItemsByCategory.length === 0 && !stockLoading && (
                  <tr>
                    <td colSpan={activePanel === 'vehicle' ? 8 : 5} className='py-12 text-center text-text-muted'>
                      No items yet for this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {activePanel === 'car-tips' && (
          <section className='mb-6 rounded-glass border border-glass-border bg-glass-surface p-6 shadow-glass backdrop-blur-glass [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text-primary'>
            <h2>Car Tips Manager</h2>
            <p className='mb-5 text-[0.9375rem] text-text-secondary'>Add and update tips shown on the landing page. One image per tip.</p>

            <div className='mb-5 flex gap-3 max-[640px]:flex-col'>
              <button
                className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'
                type='button'
                onClick={() => {
                  setEditingTipId('');
                  setNewTipTitle('');
                  setNewTipBody('');
                  setNewTipCategory('General');
                  setNewTipImageFile(null);
                  setShowTipForm(true);
                }}
                disabled={savingTipId === 'new'}
              >
                Add Tip
              </button>
              <button className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0' type='button' onClick={loadCarTips} disabled={tipsLoading}>
                {tipsLoading ? 'Refreshing...' : 'Refresh Tips'}
              </button>
            </div>

            {tipsMessage && <p className='mt-2 text-sm text-success'>{tipsMessage}</p>}
            {tipsError && <p className='mt-2 text-sm text-error'>{tipsError}</p>}

            <table className='w-full border-separate border-spacing-0 [&_th]:border-b [&_th]:border-slate-200 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-text-muted [&_td]:border-b [&_td]:border-slate-100 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-sm [&_td]:text-text-primary [&_tbody_tr:hover_td]:bg-slate-50'>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Image</th>
                  <th>Content</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {carTips.map((tip) => (
                  <tr key={tip._id}>
                    <td>{tip.title}</td>
                    <td>{tip.category || 'General'}</td>
                    <td>
                      <div className='h-10 w-[60px] overflow-hidden rounded-lg bg-slate-100 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_span]:flex [&_span]:h-full [&_span]:items-center [&_span]:justify-center [&_span]:text-[0.625rem] [&_span]:text-text-muted'>
                        {tip.imageUrl ? <img src={tip.imageUrl} alt={tip.title || 'Tip image'} /> : <span>No image</span>}
                      </div>
                    </td>
                    <td>{tip.body ? `${tip.body.slice(0, 90)}${tip.body.length > 90 ? '...' : ''}` : '-'}</td>
                    <td>
                      <div className='flex gap-2 max-[640px]:flex-col'>
                        <button
                          className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'
                          type='button'
                          onClick={() => {
                            setEditingTipId(tip._id);
                            setNewTipTitle(tip.title || '');
                            setNewTipBody(tip.body || '');
                            setNewTipCategory(tip.category || 'General');
                            setNewTipImageFile(null);
                            setShowTipForm(true);
                          }}
                          disabled={savingTipId === tip._id}
                        >
                          Edit
                        </button>
                        <button
                          className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-error px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(239,68,68,0.2)] transition hover:-translate-y-px hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'
                          type='button'
                          onClick={() => openDeleteModal('tip', tip._id, tip.title || 'this tip')}
                          disabled={savingTipId === tip._id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!tipsLoading && carTips.length === 0 && (
                  <tr>
                    <td colSpan={5} className='py-12 text-center text-text-muted'>
                      No car tips yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>
      {showTipForm && activePanel === 'car-tips' && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-6 backdrop-blur' onClick={() => (isTipSaving ? null : setShowTipForm(false))}>
          <div className='max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-glass-lg border border-glass-border bg-white/95 p-8 shadow-glass-xl backdrop-blur-3xl max-[960px]:p-6' onClick={(event) => event.stopPropagation()}>
            <div className='mb-4 flex items-center justify-between [&_h3]:m-0 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text-primary'>
              <h3>{editingTipId ? 'Edit Car Tip' : 'Add Car Tip'}</h3>
              <button
                type='button'
                className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-0 bg-slate-100 text-text-secondary transition hover:bg-slate-200 hover:text-text-primary'
                onClick={() => setShowTipForm(false)}
                disabled={isTipSaving}
                aria-label='Close tip form'
              >
                <i className='fas fa-times' />
              </button>
            </div>
            <p>Enter tip details and optional image.</p>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Title</label>
                <input
                  type='text'
                  placeholder='Tip title'
                  value={newTipTitle}
                  onChange={(event) => setNewTipTitle(event.target.value)}
                  disabled={isTipSaving}
                />
              </div>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Category</label>
                <select
                  value={newTipCategory}
                  onChange={(event) => setNewTipCategory(event.target.value)}
                  disabled={isTipSaving}
                >
                  {TIP_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Image</label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(event) => setNewTipImageFile(event.target.files?.[0] || null)}
                  disabled={isTipSaving}
                />
              </div>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Content</label>
                <textarea
                  placeholder='Tip content'
                  value={newTipBody}
                  onChange={(event) => setNewTipBody(event.target.value)}
                  disabled={isTipSaving}
                />
              </div>
            </div>
            <div className='mt-6 flex gap-3'>
              <button
                className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'
                type='button'
                onClick={editingTipId ? saveEditingTip : addCarTip}
                disabled={isTipSaving}
              >
                {isTipSaving
                  ? editingTipId
                    ? 'Saving...'
                    : 'Adding...'
                  : editingTipId
                  ? 'Save Changes'
                  : 'Add Tip'}
              </button>
              <button className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0' type='button' onClick={() => setShowTipForm(false)} disabled={isTipSaving}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showVehicleForm && activePanel === 'vehicle' && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-6 backdrop-blur' onClick={() => (savingItemId === 'new' ? null : setShowVehicleForm(false))}>
          <div className='max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-glass-lg border border-glass-border bg-white/95 p-8 shadow-glass-xl backdrop-blur-3xl max-[960px]:p-6' onClick={(event) => event.stopPropagation()}>
            <div className='mb-4 flex items-center justify-between [&_h3]:m-0 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text-primary'>
              <h3>Add New Vehicle</h3>
              <button
                type='button'
                className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-0 bg-slate-100 text-text-secondary transition hover:bg-slate-200 hover:text-text-primary'
                onClick={() => setShowVehicleForm(false)}
                disabled={savingItemId === 'new'}
                aria-label='Close vehicle form'
              >
                <i className='fas fa-times' />
              </button>
            </div>
            <p>Enter vehicle details and unit price.</p>
            <div className='grid grid-cols-2 gap-4 max-[960px]:grid-cols-1 [&_textarea]:col-span-2 max-[960px]:[&_textarea]:col-span-1'>
              <select
                value={newVehicleMake}
                onChange={(event) => {
                  setNewVehicleMake(event.target.value);
                  setNewVehicleModel('');
                  setCustomNewVehicleMake('');
                  setCustomNewVehicleModel('');
                }}
                disabled={savingItemId === 'new'}
              >
                <option value=''>Select Make</option>
                {VEHICLE_MAKES.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
                <option value={OTHER_OPTION}>Other</option>
              </select>
              {newVehicleMake === OTHER_OPTION && (
                <input
                  type='text'
                  placeholder='Enter Vehicle Make'
                  value={customNewVehicleMake}
                  onChange={(event) => setCustomNewVehicleMake(event.target.value)}
                  disabled={savingItemId === 'new'}
                />
              )}
              <select
                value={newVehicleModel}
                onChange={(event) => {
                  setNewVehicleModel(event.target.value);
                  setCustomNewVehicleModel('');
                }}
                disabled={savingItemId === 'new' || !newVehicleMake || newVehicleMake === OTHER_OPTION}
              >
                <option value=''>{newVehicleMake ? 'Select Model' : 'Select Make First'}</option>
                {adminVehicleModelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
                {newVehicleMake && newVehicleMake !== OTHER_OPTION && <option value={OTHER_OPTION}>Other</option>}
              </select>
              {(newVehicleMake === OTHER_OPTION || newVehicleModel === OTHER_OPTION) && (
                <input
                  type='text'
                  placeholder='Enter Vehicle Model'
                  value={customNewVehicleModel}
                  onChange={(event) => setCustomNewVehicleModel(event.target.value)}
                  disabled={savingItemId === 'new'}
                />
              )}
              <input
                type='number'
                min='1990'
                max='2100'
                placeholder='Year'
                value={newVehicleYear}
                onChange={(event) => setNewVehicleYear(event.target.value)}
                disabled={savingItemId === 'new'}
              />
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Description</label>
                <textarea
                  placeholder='Short vehicle description'
                  value={newVehicleDescription}
                  onChange={(event) => setNewVehicleDescription(event.target.value)}
                  disabled={savingItemId === 'new'}
                />
              </div>
              <select value={newVehicleCondition} onChange={(event) => setNewVehicleCondition(event.target.value)} disabled={savingItemId === 'new'}>
                {VEHICLE_CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
              <select value={newVehicleTransmission} onChange={(event) => setNewVehicleTransmission(event.target.value)} disabled={savingItemId === 'new'}>
                {VEHICLE_TRANSMISSIONS.map((transmission) => (
                  <option key={transmission} value={transmission}>
                    {transmission}
                  </option>
                ))}
              </select>
              <select value={newVehicleFuelType} onChange={(event) => setNewVehicleFuelType(event.target.value)} disabled={savingItemId === 'new'}>
                {VEHICLE_FUEL_TYPES.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel}
                  </option>
                ))}
              </select>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Unit Price (NGN)</label>
                <input
                  type='number'
                  min='0'
                  placeholder='Unit Price (NGN)'
                  value={newItemUnitPrice}
                  onChange={(event) => setNewItemUnitPrice(event.target.value)}
                  disabled={savingItemId === 'new'}
                />
              </div>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Primary Image</label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(event) => setNewPrimaryImageFile(event.target.files?.[0] || null)}
                  disabled={savingItemId === 'new'}
                />
              </div>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Other Images</label>
                <input
                  type='file'
                  accept='image/*'
                  multiple
                  onChange={(event) => setNewOtherImageFiles(Array.from(event.target.files || []))}
                  disabled={savingItemId === 'new'}
                />
              </div>
            </div>
            <div className='mt-6 flex gap-3'>
              <button
                className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'
                type='button'
                onClick={addStockItem}
                disabled={savingItemId === 'new'}
              >
                {savingItemId === 'new' ? 'Adding...' : activeStockMeta?.addLabel || 'Add Item'}
              </button>
              <button
                className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'
                type='button'
                onClick={() => setShowVehicleForm(false)}
                disabled={savingItemId === 'new'}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showCarPartForm && activePanel === 'car-parts' && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-6 backdrop-blur' onClick={() => (savingItemId === 'new' ? null : setShowCarPartForm(false))}>
          <div className='max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-glass-lg border border-glass-border bg-white/95 p-8 shadow-glass-xl backdrop-blur-3xl max-[960px]:p-6' onClick={(event) => event.stopPropagation()}>
            <div className='mb-4 flex items-center justify-between [&_h3]:m-0 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text-primary'>
              <h3>Add Car Part</h3>
              <button
                type='button'
                className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-0 bg-slate-100 text-text-secondary transition hover:bg-slate-200 hover:text-text-primary'
                onClick={() => setShowCarPartForm(false)}
                disabled={savingItemId === 'new'}
                aria-label='Close car part form'
              >
                <i className='fas fa-times' />
              </button>
            </div>
            <p>Enter car part details and unit price.</p>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Part Name</label>
                <input
                  type='text'
                  placeholder='Car part name'
                  value={newItemName}
                  onChange={(event) => setNewItemName(event.target.value)}
                  disabled={savingItemId === 'new'}
                />
              </div>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Description</label>
                <textarea
                  placeholder='Part description'
                  value={newItemDescription}
                  onChange={(event) => setNewItemDescription(event.target.value)}
                  disabled={savingItemId === 'new'}
                />
              </div>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Unit Price (NGN)</label>
                <input
                  type='number'
                  min='0'
                  placeholder='Unit Price (NGN)'
                  value={newItemUnitPrice}
                  onChange={(event) => setNewItemUnitPrice(event.target.value)}
                  disabled={savingItemId === 'new'}
                />
              </div>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Primary Image</label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(event) => setNewPrimaryImageFile(event.target.files?.[0] || null)}
                  disabled={savingItemId === 'new'}
                />
              </div>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Other Images</label>
                <input
                  type='file'
                  accept='image/*'
                  multiple
                  onChange={(event) => setNewOtherImageFiles(Array.from(event.target.files || []))}
                  disabled={savingItemId === 'new'}
                />
              </div>
            </div>
            <div className='mt-6 flex gap-3'>
              <button className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0' type='button' onClick={addStockItem} disabled={savingItemId === 'new'}>
                {savingItemId === 'new' ? 'Adding...' : 'Add Car Part'}
              </button>
              <button className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0' type='button' onClick={() => setShowCarPartForm(false)} disabled={savingItemId === 'new'}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showAccessoriesForm && activePanel === 'accessories' && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-6 backdrop-blur' onClick={() => (savingItemId === 'new' ? null : setShowAccessoriesForm(false))}>
          <div className='max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-glass-lg border border-glass-border bg-white/95 p-8 shadow-glass-xl backdrop-blur-3xl max-[960px]:p-6' onClick={(event) => event.stopPropagation()}>
            <div className='mb-4 flex items-center justify-between [&_h3]:m-0 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text-primary'>
              <h3>Add Accessories</h3>
              <button
                type='button'
                className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-0 bg-slate-100 text-text-secondary transition hover:bg-slate-200 hover:text-text-primary'
                onClick={() => setShowAccessoriesForm(false)}
                disabled={savingItemId === 'new'}
                aria-label='Close accessories form'
              >
                <i className='fas fa-times' />
              </button>
            </div>
            <p>Enter accessories details and unit price.</p>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Accessory Name</label>
                <input
                  type='text'
                  placeholder='Accessory name'
                  value={newItemName}
                  onChange={(event) => setNewItemName(event.target.value)}
                  disabled={savingItemId === 'new'}
                />
              </div>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Description</label>
                <textarea
                  placeholder='Accessory description'
                  value={newItemDescription}
                  onChange={(event) => setNewItemDescription(event.target.value)}
                  disabled={savingItemId === 'new'}
                />
              </div>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Unit Price (NGN)</label>
                <input
                  type='number'
                  min='0'
                  placeholder='Unit Price (NGN)'
                  value={newItemUnitPrice}
                  onChange={(event) => setNewItemUnitPrice(event.target.value)}
                  disabled={savingItemId === 'new'}
                />
              </div>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Primary Image</label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(event) => setNewPrimaryImageFile(event.target.files?.[0] || null)}
                  disabled={savingItemId === 'new'}
                />
              </div>
              <div className='flex flex-col gap-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-text-secondary [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:text-[0.9375rem] [&_input]:text-text-primary [&_input]:outline-none [&_input:focus]:border-primary [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none'>
                <label>Other Images</label>
                <input
                  type='file'
                  accept='image/*'
                  multiple
                  onChange={(event) => setNewOtherImageFiles(Array.from(event.target.files || []))}
                  disabled={savingItemId === 'new'}
                />
              </div>
            </div>
            <div className='mt-6 flex gap-3'>
              <button className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0' type='button' onClick={addStockItem} disabled={savingItemId === 'new'}>
                {savingItemId === 'new' ? 'Adding...' : 'Add Accessories'}
              </button>
              <button className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0' type='button' onClick={() => setShowAccessoriesForm(false)} disabled={savingItemId === 'new'}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteModal.open && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-6 backdrop-blur' onClick={closeDeleteModal}>
          <div className='max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-glass-lg border border-glass-border bg-white/95 p-8 shadow-glass-xl backdrop-blur-3xl max-[960px]:p-6' onClick={(event) => event.stopPropagation()}>
            <div className='mb-4 flex items-center justify-between [&_h3]:m-0 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text-primary'>
              <h3>Confirm Delete</h3>
              <button
                type='button'
                className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-0 bg-slate-100 text-text-secondary transition hover:bg-slate-200 hover:text-text-primary'
                onClick={closeDeleteModal}
                disabled={deleteModal.processing}
                aria-label='Close delete confirmation'
              >
                <i className='fas fa-times' />
              </button>
            </div>
            <p>
              Delete "{deleteModal.label}"? This action cannot be undone.
            </p>
            <div className='mt-6 flex gap-3'>
              <button className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-error px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(239,68,68,0.2)] transition hover:-translate-y-px hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0' type='button' onClick={confirmDelete} disabled={deleteModal.processing}>
                {deleteModal.processing ? 'Deleting...' : 'Delete'}
              </button>
              <button className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0' type='button' onClick={closeDeleteModal} disabled={deleteModal.processing}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
