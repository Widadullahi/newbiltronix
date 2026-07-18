import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  clearInspectorSession,
  confirmInspectorPasswordReset,
  createInspectionReport,
  createInspectorAccount,
  fetchInspectionReportsByAccount,
  loginInspectorAccount,
  requestInspectorPasswordReset,
  updateInspectorAccount,
} from '../lib/sanityClient.js';
import { OTHER_OPTION, VEHICLE_MAKES, VEHICLE_MODELS_BY_MAKE } from '../lib/vehicleOptions.js';

const CHECK_SECTIONS = [
  { title: 'Exterior Inspection', items: ['Body Condition', 'Headlights', 'Glass & Mirrors', 'Tires', 'License Plates'] },
  { title: 'Interior Inspection', items: ['Seatbelts', 'Dashboard', 'Controls', 'Seats & Upholstery', 'Floor Mats'] },
  { title: 'Engine Compartment', items: ['Fluid Levels', 'Belts & Hoses', 'Battery', 'Engine Condition'] },
  { title: 'Undercarriage Inspection', items: ['Exhaust System', 'Suspension', 'Brakes', 'Steering'] },
  { title: 'Safety Equipment', items: ['Spare Tire & Tools', 'Jack', 'Warning Triangles', 'First Aid Kit'] },
  { title: 'Vehicle Documentation', items: ['Registration', 'Insurance', 'Service Records', 'Owner Manual'] },
  { title: 'Compliance & Emissions', items: ['Emission Control', 'Inspection Sticker', 'Local Compliance'] },
];

const VERDICT_OPTIONS = ['Excellent', 'Good', 'Fair', 'Poor'];
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;
const REG_NUMBER_REGEX = /^[A-Z]{3}-?\d{3}-?[A-Z]{2}$/;

function normalizeRegNumber(input) {
  return String(input || '')
    .toUpperCase()
    .trim()
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, '');
}

function defaultChecklist() {
  return CHECK_SECTIONS.flatMap((section) =>
    section.items.map((label) => ({ section: section.title, label, status: 'Good', note: '' }))
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function imageFormat(dataUrl) {
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP';
  return 'JPEG';
}

function createReportPdf(report, account) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const watermarkLabel = String(account.companyName || 'Inspection').trim() || 'Inspection';

  const drawDiagonalWatermark = () => {
    doc.setTextColor(221, 230, 244);
    doc.setFontSize(52);
    doc.text(watermarkLabel, pageWidth / 2, pageHeight / 2, { align: 'center', angle: -30 });
  };

  const drawFrame = () => {
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setDrawColor(20, 48, 95);
    doc.setLineWidth(1.2);
    doc.roundedRect(20, 20, pageWidth - 40, pageHeight - 40, 10, 10);
    doc.setFillColor(20, 48, 95);
    doc.rect(28, 28, pageWidth - 56, 82, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(account.companyName || 'Company Name', 40, 60);
    if (account.companyLogoDataUrl) {
      try {
        doc.setDrawColor(255, 255, 255);
        doc.roundedRect(pageWidth - 112, 38, 68, 52, 8, 8);
        doc.addImage(account.companyLogoDataUrl, imageFormat(account.companyLogoDataUrl), pageWidth - 108, 42, 60, 44);
      } catch {
        // ignore
      }
    }
    doc.setFontSize(10);
    doc.text(account.companyAddress || '', 40, 78, { maxWidth: pageWidth - 180 });
    doc.text(`Inspector: ${account.fullName || ''} | WhatsApp: ${account.phone || ''}`, 40, 98);
  };

  drawFrame();

  doc.setTextColor(20, 48, 95);
  doc.setFontSize(16);
  doc.text('Pre-Purchase Vehicle Inspection Report', 30, 134);
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(report.inspectedAt).toLocaleString()}`, 30, 150);
  doc.text(`Vehicle: ${report.vehicleLabel || '-'}`, 30, 164);
  doc.text(`Registration: ${report.vehicleRegNo || '-'}`, 30, 178);
  doc.text(`VIN: ${report.vin || '-'}`, 30, 192);
  doc.text(`Mileage: ${report.mileage || '-'} km`, 250, 192);
  doc.text(`Transmission: ${report.transmission || '-'}`, 30, 206);
  doc.text(`Fuel Type: ${report.fuelType || '-'}`, 250, 206);
  doc.text(`Overall Verdict: ${report.overallVerdict || '-'}`, 30, 220);

  autoTable(doc, {
    startY: 236,
    head: [['Section', 'Inspection Item', 'Status', 'Comments']],
    body: (report.checklist || []).map((item) => [item.section || '', item.label || '', item.status || '', item.note || '-']),
    styles: { fontSize: 8.5, cellPadding: 5.5 },
    headStyles: { fillColor: [20, 48, 95] },
    alternateRowStyles: { fillColor: [250, 252, 255] },
    margin: { left: 30, right: 30 },
  });

  let y = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 470) + 16;
  doc.setFontSize(11);
  doc.setTextColor(20, 48, 95);
  doc.text('Recommendation', 30, y);
  doc.setFontSize(10);
  doc.setTextColor(60, 72, 94);
  const recommendationLines = doc.splitTextToSize(report.recommendation || 'No recommendation provided.', pageWidth - 70);
  doc.text(recommendationLines, 30, y + 15);
  y += recommendationLines.length * 12 + 26;

  const images = Array.isArray(report.images) ? report.images : [];
  if (images.length > 0) {
    const cardW = 250;
    const cardH = 150;
    const gapX = 18;
    const gapY = 22;
    const startX = 30;

    doc.setFontSize(11);
    doc.setTextColor(20, 48, 95);

    images.forEach((img, index) => {
      const col = index % 2;
      const isNewRow = col === 0;
      if (isNewRow && index > 0) y += cardH + gapY;
      if (y + cardH + 40 > pageHeight - 40) {
        doc.addPage();
        drawFrame();
        y = 130;
      }
      if (col === 0) doc.text('Inspection Image Attachments', 30, y - 10);
      const x = startX + col * (cardW + gapX);
      doc.setDrawColor(216, 224, 240);
      doc.roundedRect(x, y, cardW, cardH, 8, 8);
      try {
        doc.addImage(img, imageFormat(img), x + 6, y + 6, cardW - 12, cardH - 12);
      } catch {
        doc.setTextColor(180, 0, 0);
        doc.text('Image preview unavailable', x + 10, y + 20);
      }
    });

    y += cardH + 24;
  }

  if (y + 70 > pageHeight - 30) {
    doc.addPage();
    drawFrame();
    y = 130;
  }

  doc.setDrawColor(130, 140, 168);
  doc.line(30, y, 230, y);
  if (account.signatureDataUrl) {
    try {
      doc.addImage(account.signatureDataUrl, imageFormat(account.signatureDataUrl), 34, y - 45, 120, 36);
    } catch {
      // ignore
    }
  }

  doc.setTextColor(20, 48, 95);
  doc.setFontSize(10);
  doc.text(account.fullName || 'Inspector', 30, y + 14);
  doc.text(account.companyName || '', 30, y + 28);

  const totalPages = doc.getNumberOfPages();
  for (let pageIndex = 1; pageIndex <= totalPages; pageIndex += 1) {
    doc.setPage(pageIndex);
    drawDiagonalWatermark();
  }

  const fileId = (report.vehicleRegNo || report.vehicleLabel || 'vehicle').replace(/\s+/g, '-').toLowerCase();
  doc.save(`prepurchase-inspection-${fileId}.pdf`);
}

function PasswordVisibilityToggle({ visible, onToggle }) {
  return (
    <button
      type='button'
      onClick={onToggle}
      className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200'
      aria-label={visible ? 'Hide password' : 'Show password'}
    >
      {visible ? (
        <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='1.8'>
          <path d='M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12Z' />
          <circle cx='12' cy='12' r='3' />
        </svg>
      ) : (
        <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='1.8'>
          <path d='M3 3l18 18' />
          <path d='M10.6 10.6A3 3 0 0 0 13.4 13.4' />
          <path d='M9.2 5.2A11.7 11.7 0 0 1 12 4c6 0 9.5 6 9.5 8a11.8 11.8 0 0 1-2.6 3.7' />
          <path d='M6.5 7.4A12.2 12.2 0 0 0 2.5 12s3.5 6 9.5 6c1.4 0 2.8-.2 4-.6' />
        </svg>
      )}
    </button>
  );
}

export default function InspectionPortalPage() {
  const inspectorAccountStorageKey = 'biltronix_inspector_account';
  const [account, setAccount] = useState(null);
  const [authMode, setAuthMode] = useState('register');
  const [activeTab, setActiveTab] = useState('new');
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [registration, setRegistration] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    companyAddress: '',
    signatureDataUrl: '',
    companyLogoDataUrl: '',
  });

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showRegistrationPassword, setShowRegistrationPassword] = useState(false);
  const [showRegistrationConfirmPassword, setShowRegistrationConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settings, setSettings] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    companyAddress: '',
    signatureDataUrl: '',
    companyLogoDataUrl: '',
  });

  const [inspection, setInspection] = useState({
    vehicleMake: '',
    vehicleModel: '',
    year: '',
    color: '',
    vin: '',
    regNo: '',
    mileage: '',
    transmission: '',
    fuelType: '',
    overallVerdict: 'Good',
    recommendation: '',
    checklist: defaultChecklist(),
    images: [],
  });
  const [customInspectionMake, setCustomInspectionMake] = useState('');
  const [customInspectionModel, setCustomInspectionModel] = useState('');

  const groupedChecklist = useMemo(
    () =>
      CHECK_SECTIONS.map((section) => ({
        title: section.title,
        rows: inspection.checklist.filter((item) => item.section === section.title),
      })),
    [inspection.checklist]
  );
  const inspectionModelOptions = useMemo(() => {
    if (!inspection.vehicleMake || inspection.vehicleMake === OTHER_OPTION) return [];
    return VEHICLE_MODELS_BY_MAKE[inspection.vehicleMake] || [];
  }, [inspection.vehicleMake]);

  const inspectionCount = reports.length;

  const loadReports = async (accountId) => {
    if (!accountId) return;
    setLoadingReports(true);
    try {
      const remote = await fetchInspectionReportsByAccount(accountId);
      setReports(remote);
    } catch (loadError) {
      setReports([]);
      setError(loadError instanceof Error ? loadError.message : 'Could not load inspection reports from API.');
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(inspectorAccountStorageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed && parsed._id) {
        setAccount(parsed);
      }
    } catch {
      // ignore storage parse issues
    }
  }, []);

  useEffect(() => {
    try {
      if (!account) {
        window.localStorage.removeItem(inspectorAccountStorageKey);
        return;
      }
      window.localStorage.setItem(inspectorAccountStorageKey, JSON.stringify(account));
    } catch {
      // ignore storage errors
    }
  }, [account]);

  useEffect(() => {
    if (account?._id) {
      loadReports(account._id);
    }
  }, [account?._id]);

  useEffect(() => {
    if (!account) return;
    setSettings({
      fullName: account.fullName || '',
      email: account.email || '',
      phone: account.phone || '',
      companyName: account.companyName || '',
      companyAddress: account.companyAddress || '',
      signatureDataUrl: account.signatureDataUrl || '',
      companyLogoDataUrl: account.companyLogoDataUrl || '',
    });
  }, [account]);

  const registerAccount = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (registration.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (registration.password !== registration.confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    const payload = { ...registration };

    try {
      const created = await createInspectorAccount(payload);
      setAccount(created);
      setMessage('Account created. You can now create inspections.');
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Could not create account.');
    }
  };

  const loginAccount = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const loggedIn = await loginInspectorAccount(loginData.email.trim(), loginData.password);
      setAccount(loggedIn);
      setMessage('Logged in successfully.');
      return;
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Invalid email or password.');
    }
  };

  const requestPasswordReset = async () => {
    const email = resetEmail.trim().toLowerCase();
    if (!email) {
      setError('Enter your email to request OTP.');
      return;
    }

    setMessage('');
    setError('');
    setResetBusy(true);
    try {
      const response = await requestInspectorPasswordReset(email);
      if (response?.devOtp) {
        setMessage(`OTP sent (dev mode): ${response.devOtp}`);
      } else {
        setMessage('If this email exists, OTP has been sent. Check your inbox.');
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not request OTP.');
    } finally {
      setResetBusy(false);
    }
  };

  const confirmPasswordReset = async () => {
    const email = resetEmail.trim().toLowerCase();
    if (!email || !resetOtp.trim()) {
      setError('Enter your email and OTP.');
      return;
    }
    if (resetPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setMessage('');
    setError('');
    setResetBusy(true);
    try {
      await confirmInspectorPasswordReset(email, resetOtp, resetPassword);
      setMessage('Password reset successful. You can now login with your new password.');
      setResetOtp('');
      setResetPassword('');
      setResetConfirmPassword('');
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : 'Could not reset password.');
    } finally {
      setResetBusy(false);
    }
  };

  const uploadSignature = async (file) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setRegistration((prev) => ({ ...prev, signatureDataUrl: dataUrl }));
  };

  const uploadCompanyLogo = async (file) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setRegistration((prev) => ({ ...prev, companyLogoDataUrl: dataUrl }));
  };

  const uploadSettingsSignature = async (file) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setSettings((prev) => ({ ...prev, signatureDataUrl: dataUrl }));
  };

  const uploadSettingsCompanyLogo = async (file) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setSettings((prev) => ({ ...prev, companyLogoDataUrl: dataUrl }));
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    if (!account?._id) return;
    setSavingSettings(true);
    setMessage('');
    setError('');
    try {
      const updated = await updateInspectorAccount(account._id, settings);
      setAccount(updated);
      setMessage('Settings updated successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not update settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const updateChecklist = (sectionTitle, indexInSection, field, value) => {
    setInspection((prev) => {
      let seen = -1;
      const next = prev.checklist.map((item) => {
        if (item.section !== sectionTitle) return item;
        seen += 1;
        if (seen !== indexInSection) return item;
        return { ...item, [field]: value };
      });
      return { ...prev, checklist: next };
    });
  };

  const uploadInspectionImages = async (files) => {
    const list = Array.from(files || []).slice(0, 10);
    const dataUrls = await Promise.all(list.map((file) => readFileAsDataUrl(file)));
    setInspection((prev) => ({ ...prev, images: dataUrls }));
  };

  const submitInspection = async (event) => {
    event.preventDefault();
    if (!account) return;
    setMessage('');
    setError('');

    const resolvedInspectionMake =
      inspection.vehicleMake === OTHER_OPTION ? customInspectionMake.trim() : inspection.vehicleMake.trim();
    const resolvedInspectionModel =
      inspection.vehicleModel === OTHER_OPTION ? customInspectionModel.trim() : inspection.vehicleModel.trim();

    if (!resolvedInspectionMake || !resolvedInspectionModel) {
      setError('Vehicle make and model are required.');
      return;
    }

    const vinValue = String(inspection.vin || '').trim().toUpperCase();
    const regValue = normalizeRegNumber(inspection.regNo);

    if (vinValue && !VIN_REGEX.test(vinValue)) {
      setError('VIN must be exactly 17 characters and should not contain I, O, or Q.');
      return;
    }

    if (regValue && !REG_NUMBER_REGEX.test(regValue)) {
      setError('Registration number must follow format: ABC-123-DE (letters and numbers only).');
      return;
    }

    const report = {
      accountId: account._id,
      companyName: account.companyName,
      inspectorName: account.fullName,
      vehicleLabel: `${inspection.year} ${resolvedInspectionMake} ${resolvedInspectionModel}`.trim(),
      vehicleRegNo: regValue,
      vin: vinValue,
      mileage: inspection.mileage,
      transmission: inspection.transmission,
      fuelType: inspection.fuelType,
      inspectedAt: new Date().toISOString(),
      checklist: inspection.checklist,
      images: inspection.images,
      overallVerdict: inspection.overallVerdict,
      recommendation: inspection.recommendation,
    };

    try {
      const saved = await createInspectionReport(report);
      setReports((prev) => [saved, ...prev]);
      createReportPdf(saved, account);
      setMessage('Inspection saved and PDF downloaded.');
      setError('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save inspection report.');
    }

    setInspection({
      vehicleMake: '',
      vehicleModel: '',
      year: '',
      color: '',
      vin: '',
      regNo: '',
      mileage: '',
      transmission: '',
      fuelType: '',
      overallVerdict: 'Good',
      recommendation: '',
      checklist: defaultChecklist(),
      images: [],
    });
    setCustomInspectionMake('');
    setCustomInspectionModel('');
    setActiveTab('records');
  };

  const logout = () => {
    clearInspectorSession();
    setAccount(null);
    setReports([]);
    setMessage('');
    setError('');
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setError('');
    setMessage('');
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setError('');
    setMessage('');
  };

  const renderAuthContent = () => (
    <>
      <div className='mb-5 flex rounded-2xl bg-white/10 p-1'>
        <button
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${authMode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300'}`}
          onClick={() => setAuthMode('register')}
          type='button'
        >
          Create Account
        </button>
        <button
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${authMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300'}`}
          onClick={() => setAuthMode('login')}
          type='button'
        >
          Sign In
        </button>
      </div>

      <h3 className='mb-2 text-xl font-semibold'>Access your inspection workspace</h3>
      <p className='mb-5 text-sm leading-7 text-slate-400'>Choose the option that fits you best and continue in seconds.</p>

      {authMode === 'register' ? (
        <form className='space-y-3' onSubmit={registerAccount}>
          <input className='w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required placeholder='Full Name' value={registration.fullName} onChange={(e) => setRegistration((p) => ({ ...p, fullName: e.target.value }))} />
          <input className='w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required type='email' placeholder='Email' value={registration.email} onChange={(e) => setRegistration((p) => ({ ...p, email: e.target.value }))} />
          <div className='relative'>
            <input className='w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 pr-12 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required type={showRegistrationPassword ? 'text' : 'password'} placeholder='Password' value={registration.password} onChange={(e) => setRegistration((p) => ({ ...p, password: e.target.value }))} />
            <PasswordVisibilityToggle visible={showRegistrationPassword} onToggle={() => setShowRegistrationPassword((prev) => !prev)} />
          </div>
          <div className='relative'>
            <input className='w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 pr-12 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required type={showRegistrationConfirmPassword ? 'text' : 'password'} placeholder='Confirm Password' value={registration.confirmPassword} onChange={(e) => setRegistration((p) => ({ ...p, confirmPassword: e.target.value }))} />
            <PasswordVisibilityToggle visible={showRegistrationConfirmPassword} onToggle={() => setShowRegistrationConfirmPassword((prev) => !prev)} />
          </div>
          <input className='w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required placeholder='WhatsApp Number' value={registration.phone} onChange={(e) => setRegistration((p) => ({ ...p, phone: e.target.value }))} />
          <input className='w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required placeholder='Company Name' value={registration.companyName} onChange={(e) => setRegistration((p) => ({ ...p, companyName: e.target.value }))} />
          <textarea className='w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required placeholder='Company Address' value={registration.companyAddress} onChange={(e) => setRegistration((p) => ({ ...p, companyAddress: e.target.value }))} />
          <label className='flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm font-medium text-slate-300 transition hover:border-primary hover:bg-primary/10'>
            Company Logo Upload
            <input type='file' accept='image/*' onChange={(e) => uploadCompanyLogo(e.target.files?.[0])} className='hidden' />
          </label>
          {registration.companyLogoDataUrl && <img className='h-20 w-20 rounded-2xl border border-white/10 bg-slate-900 object-contain' src={registration.companyLogoDataUrl} alt='Company logo preview' />}
          <label className='flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm font-medium text-slate-300 transition hover:border-primary hover:bg-primary/10'>
            Optional Signature Upload
            <input type='file' accept='image/*' onChange={(e) => uploadSignature(e.target.files?.[0])} className='hidden' />
          </label>
          {registration.signatureDataUrl && <img className='h-20 w-20 rounded-2xl border border-white/10 bg-slate-900 object-contain' src={registration.signatureDataUrl} alt='Signature preview' />}
          <button className='w-full rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(59,130,246,0.24)] transition hover:bg-primary-600' type='submit'>Create Account</button>
        </form>
      ) : (
        <>
          <form className='space-y-3' onSubmit={loginAccount}>
            <input className='w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required type='email' placeholder='Email' value={loginData.email} onChange={(e) => setLoginData((p) => ({ ...p, email: e.target.value }))} />
            <div className='relative'>
              <input className='w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 pr-12 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required type={showLoginPassword ? 'text' : 'password'} placeholder='Password' value={loginData.password} onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))} />
              <PasswordVisibilityToggle visible={showLoginPassword} onToggle={() => setShowLoginPassword((prev) => !prev)} />
            </div>
            <button className='w-full rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(59,130,246,0.24)] transition hover:bg-primary-600' type='submit'>Login to Dashboard</button>
          </form>
          <div className='mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4'>
            <h4 className='text-sm font-semibold text-white'>Forgot Password</h4>
            <input className='w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' type='email' placeholder='Your account email' value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} disabled={resetBusy} />
            <button className='w-full rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(59,130,246,0.24)] transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60' type='button' onClick={requestPasswordReset} disabled={resetBusy}>{resetBusy ? 'Please wait...' : 'Request OTP'}</button>
            <input className='w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' type='text' placeholder='Enter OTP' value={resetOtp} onChange={(e) => setResetOtp(e.target.value)} disabled={resetBusy} />
            <div className='relative'>
              <input className='w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 pr-12 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' type={showResetPassword ? 'text' : 'password'} placeholder='New password' value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} disabled={resetBusy} />
              <PasswordVisibilityToggle visible={showResetPassword} onToggle={() => setShowResetPassword((prev) => !prev)} />
            </div>
            <div className='relative'>
              <input className='w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 pr-12 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' type={showResetConfirmPassword ? 'text' : 'password'} placeholder='Confirm new password' value={resetConfirmPassword} onChange={(e) => setResetConfirmPassword(e.target.value)} disabled={resetBusy} />
              <PasswordVisibilityToggle visible={showResetConfirmPassword} onToggle={() => setShowResetConfirmPassword((prev) => !prev)} />
            </div>
            <button className='w-full rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(59,130,246,0.24)] transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60' type='button' onClick={confirmPasswordReset} disabled={resetBusy}>{resetBusy ? 'Please wait...' : 'Reset Password'}</button>
          </div>
        </>
      )}

      {message && <p className='mt-4 rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm font-medium text-emerald-300'>{message}</p>}
      {error && <p className='mt-4 rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-medium text-rose-300'>{error}</p>}
    </>
  );

  if (!account) {
    return (
      <div className='min-h-screen bg-[linear-gradient(135deg,#f7f3ea_0%,#f4f7fb_55%,#f8fafc_100%)] text-slate-800'>
        <header className='border-b border-slate-200/80 bg-white/85 backdrop-blur-xl'>
          <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5'>
            <Link to='/' className='text-sm font-semibold text-slate-700 transition hover:text-primary'>
              ← Back to Home
            </Link>
            <div className='flex gap-2'>
              <button type='button' onClick={() => openAuth('login')} className='rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary'>Sign In</button>
              <button type='button' onClick={() => openAuth('register')} className='rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.2)] transition hover:bg-primary-600'>Create Account</button>
            </div>
          </div>
        </header>

        <main className='mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:px-8 lg:py-10'>
          <section className='relative overflow-hidden border border-slate-200 bg-slate-950 shadow-[0_8px_24px_rgba(15,23,42,0.03)] lg:p-0'>
            <div className='absolute inset-0 bg-cover bg-center' style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80')" }} />
            <div className='absolute inset-0 bg-slate-950/70' />
            <div className='relative grid gap-6 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10'>
              <div className='max-w-2xl text-white'>
                <p className='text-sm font-semibold uppercase tracking-[0.35em] text-slate-300'>Inspection workspace</p>
                <h2 className='mt-4 text-3xl font-bold leading-tight sm:text-4xl'>A premium way to document vehicle condition.</h2>
                <p className='mt-4 text-base leading-8 text-slate-300'>
                  Built for teams that need a clear record from first inspection to final handoff, with the calm confidence of a professional workflow.
                </p>

                <div className='mt-8 border border-white/15 bg-white/10 p-5 backdrop-blur-sm'>
                  <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-300'>How it works</p>
                  <ul className='mt-3 space-y-2 text-sm leading-7 text-slate-200'>
                    <li>• Structured checks for each vehicle system.</li>
                    <li>• Photos, notes, and verdicts kept together.</li>
                    <li>• A polished PDF ready for client handoff.</li>
                  </ul>
                </div>
              </div>

              <div className='min-h-[220px]' />
            </div>
          </section>

          <section className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
            <div className='  p-8 '>
              <p className='text-sm font-semibold uppercase tracking-[0.3em] text-primary'>Built for daily use</p>
              <h3 className='mt-3 text-2xl font-bold text-slate-900'>A process that stays consistent from inspection to handoff.</h3>
              <p className='mt-3 text-base leading-8 text-slate-600'>The flow is simple enough for repeat work, but thorough enough to keep every report credible and easy to read.</p>
              <div className='mt-6 space-y-3'>
                <div className='border border-slate-200 bg-slate-50 p-4'>
                  <p className='font-semibold text-slate-900'>Clear structure</p>
                  <p className='mt-1 text-sm text-slate-600'>Every inspection follows a familiar layout, which makes follow-up easier for both teams and clients.</p>
                </div>
                <div className='border border-slate-200 bg-slate-50 p-4'>
                  <p className='font-semibold text-slate-900'>Professional delivery</p>
                  <p className='mt-1 text-sm text-slate-600'>The final PDF keeps your company identity, signature, and recommendations in one place.</p>
                </div>
              </div>
            </div>

            <div className='relative min-h-[320px] overflow-hidden border border-slate-200 shadow-sm'>
              <div className='absolute inset-0 bg-cover bg-center' style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=80')" }} />
              <div className='absolute inset-0 bg-slate-950/55' />
              <div className='relative flex h-full flex-col justify-end p-8 text-white'>
                <p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-300'>What the experience feels like</p>
                <h3 className='mt-3 text-2xl font-bold'>Focused, quiet, and ready to be shared.</h3>
                <p className='mt-3 max-w-xl text-base leading-8 text-slate-200'>The layout is intentionally restrained so the report, not the interface, remains the focus.</p>
              </div>
            </div>
          </section>

          <section className='px-2 py-8 text-slate-700'>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <div>
                <p className='text-sm font-semibold uppercase tracking-[0.3em] text-primary'>Ready to begin</p>
                <h3 className='mt-2 text-2xl font-bold text-slate-900'>Start with a straightforward workspace and build from there.</h3>
              </div>
              <div className='flex flex-wrap gap-3'>
                <button type='button' onClick={() => openAuth('register')} className='rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-600'>Create Account</button>
                <button type='button' onClick={() => openAuth('login')} className='rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary'>Sign In</button>
              </div>
            </div>
          </section>
        </main>

        {isAuthModalOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm'>
            <div className='relative w-full max-w-2xl rounded-[28px] border border-white/10 bg-slate-950/95 p-5 text-slate-100 shadow-2xl sm:p-8'>
              <button type='button' onClick={closeAuthModal} className='absolute right-4 top-4 rounded-full border border-white/10 bg-white/10 p-2 text-slate-200 transition hover:bg-white/20'>
                ✕
              </button>
              <div className='max-h-[80vh] overflow-y-auto pr-2'>
                {renderAuthContent()}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_55%,#f8fafc_100%)]'>
      <header className='border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl'>
        <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5'>
          <Link to='/' className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary hover:text-primary'>
            ← Back to Home
          </Link>
          <div className='text-right'>
            <p className='text-xs font-semibold uppercase tracking-[0.3em] text-primary'>Inspection Dashboard</p>
            <h1 className='mt-1 text-2xl font-bold text-slate-900'>Manage reports and inspections</h1>
          </div>
        </div>
      </header>

      <div className='mx-auto max-w-7xl px-6 py-8'>
        <section className='mb-6 rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl'>
          <div className='flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-[0.25em] text-primary'>Welcome back</p>
              <h2 className='mt-2 text-3xl font-bold text-slate-900'>{account.companyName || 'Inspection Team'}</h2>
              <p className='mt-3 max-w-2xl text-base leading-7 text-slate-600'>
                Review completed inspections, create a new report, and export a polished PDF for your client in a few clicks.
              </p>
            </div>
            <div className='grid gap-3 sm:grid-cols-3'>
              <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center'>
                <p className='text-xs uppercase tracking-wide text-slate-500'>Completed</p>
                <p className='mt-1 text-2xl font-bold text-slate-900'>{inspectionCount}</p>
              </div>
              <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center'>
                <p className='text-xs uppercase tracking-wide text-slate-500'>Checklist</p>
                <p className='mt-1 text-2xl font-bold text-slate-900'>{inspection.checklist.length}</p>
              </div>
              <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center'>
                <p className='text-xs uppercase tracking-wide text-slate-500'>Media</p>
                <p className='mt-1 text-2xl font-bold text-slate-900'>10 max</p>
              </div>
            </div>
          </div>
        </section>

        <div className='flex flex-col gap-6 xl:flex-row'>
          <aside className='xl:w-[280px]'>
            <div className='rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.07)]'>
              <p className='text-sm font-semibold text-primary'>Inspector profile</p>
              <h3 className='mt-2 text-xl font-bold text-slate-900'>{account.companyName}</h3>
              <p className='mt-1 text-sm text-slate-600'>{account.fullName}</p>
              <div className='mt-5 rounded-2xl bg-primary-50 p-4 text-center'>
                <p className='text-xs uppercase tracking-[0.25em] text-slate-500'>Inspections completed</p>
                <p className='mt-2 text-3xl font-bold text-primary'>{inspectionCount}</p>
              </div>
              <div className='mt-5 space-y-2'>
                <button className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeTab === 'new' ? 'bg-primary-50 text-primary' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`} onClick={() => setActiveTab('new')} type='button'>New Pre-Purchase Inspection</button>
                <button className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeTab === 'records' ? 'bg-primary-50 text-primary' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`} onClick={() => setActiveTab('records')} type='button'>Records</button>
                <button className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeTab === 'settings' ? 'bg-primary-50 text-primary' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`} onClick={() => setActiveTab('settings')} type='button'>Settings</button>
                <button className='w-full rounded-2xl bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-slate-800' onClick={logout} type='button'>Logout</button>
              </div>
            </div>
          </aside>

          <main className='min-w-0 flex-1'>
            {message && <p className='mb-4 rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm font-medium text-emerald-700'>{message}</p>}
            {error && <p className='mb-4 rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-medium text-rose-700'>{error}</p>}

            {activeTab === 'new' && (
              <section className='rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-xl'>
                <div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
                  <div>
                    <p className='text-sm font-semibold uppercase tracking-[0.25em] text-primary'>Create report</p>
                    <h2 className='mt-2 text-2xl font-bold text-slate-900'>New Pre-Purchase Inspection</h2>
                    <p className='mt-2 max-w-2xl text-sm leading-7 text-slate-600'>
                      Complete the vehicle details, run the checklist, attach clear photos, and generate a polished PDF report for your client.
                    </p>
                  </div>
                  <div className='grid gap-3 sm:grid-cols-3'>
                    <div className='rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center'>
                      <p className='text-[11px] uppercase tracking-wide text-slate-500'>Checklist</p>
                      <p className='mt-1 text-lg font-bold text-slate-900'>{inspection.checklist.length}</p>
                    </div>
                    <div className='rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center'>
                      <p className='text-[11px] uppercase tracking-wide text-slate-500'>Image slots</p>
                      <p className='mt-1 text-lg font-bold text-slate-900'>10 max</p>
                    </div>
                    <div className='rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center'>
                      <p className='text-[11px] uppercase tracking-wide text-slate-500'>Format</p>
                      <p className='mt-1 text-lg font-bold text-slate-900'>PDF</p>
                    </div>
                  </div>
                </div>

                <form className='space-y-6' onSubmit={submitInspection}>
                  <div className='rounded-[24px] border border-slate-200 bg-slate-50/70 p-5'>
                    <h3 className='mb-4 text-lg font-semibold text-slate-900'>Vehicle Information</h3>
                    <div className='grid gap-4 md:grid-cols-2'>
                      <select className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required value={inspection.vehicleMake} onChange={(e) => { setInspection((p) => ({ ...p, vehicleMake: e.target.value, vehicleModel: '' })); setCustomInspectionMake(''); setCustomInspectionModel(''); }}>
                        <option value='' disabled>Vehicle Make</option>
                        {VEHICLE_MAKES.map((make) => (
                          <option key={make} value={make}>{make}</option>
                        ))}
                        <option value={OTHER_OPTION}>Other</option>
                      </select>
                      {inspection.vehicleMake === OTHER_OPTION && (
                        <input className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required placeholder='Enter Vehicle Make' value={customInspectionMake} onChange={(e) => setCustomInspectionMake(e.target.value)} />
                      )}
                      <select className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required value={inspection.vehicleModel} onChange={(e) => { setInspection((p) => ({ ...p, vehicleModel: e.target.value })); setCustomInspectionModel(''); }} disabled={!inspection.vehicleMake || inspection.vehicleMake === OTHER_OPTION}>
                        <option value='' disabled>{inspection.vehicleMake ? 'Vehicle Model' : 'Select Make First'}</option>
                        {inspectionModelOptions.map((model) => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                        {inspection.vehicleMake && inspection.vehicleMake !== OTHER_OPTION && <option value={OTHER_OPTION}>Other</option>}
                      </select>
                      {(inspection.vehicleMake === OTHER_OPTION || inspection.vehicleModel === OTHER_OPTION) && (
                        <input className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required placeholder='Enter Vehicle Model' value={customInspectionModel} onChange={(e) => setCustomInspectionModel(e.target.value)} />
                      )}
                      <input className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required type='number' placeholder='Year' value={inspection.year} onChange={(e) => setInspection((p) => ({ ...p, year: e.target.value }))} />
                      <input className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' placeholder='Color' value={inspection.color} onChange={(e) => setInspection((p) => ({ ...p, color: e.target.value }))} />
                      <input className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' placeholder='VIN (17 characters)' value={inspection.vin} maxLength={17} pattern='[A-HJ-NPR-Z0-9]{17}' title='VIN must be 17 characters. Letters I, O, and Q are not allowed.' onChange={(e) => setInspection((p) => ({ ...p, vin: e.target.value.toUpperCase() }))} />
                      <input className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' placeholder='Registration Number (ABC-123-DE)' value={inspection.regNo} maxLength={12} pattern='[A-Za-z]{3}-?[0-9]{3}-?[A-Za-z]{2}' title='Use format like ABC-123-DE.' onChange={(e) => setInspection((p) => ({ ...p, regNo: e.target.value.toUpperCase() }))} />
                      <input className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' placeholder='Mileage (km)' value={inspection.mileage} onChange={(e) => setInspection((p) => ({ ...p, mileage: e.target.value }))} />
                      <select className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required value={inspection.transmission} onChange={(e) => setInspection((p) => ({ ...p, transmission: e.target.value }))}>
                        <option value='' disabled>Transmission</option>
                        <option value='Automatic'>Automatic</option>
                        <option value='Manual'>Manual</option>
                      </select>
                      <select className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required value={inspection.fuelType} onChange={(e) => setInspection((p) => ({ ...p, fuelType: e.target.value }))}>
                        <option value='' disabled>Fuel Type</option>
                        <option value='Petrol'>Petrol</option>
                        <option value='Diesel'>Diesel</option>
                        <option value='Hybrid'>Hybrid</option>
                        <option value='Electric'>Electric</option>
                      </select>
                      <select className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' value={inspection.overallVerdict} onChange={(e) => setInspection((p) => ({ ...p, overallVerdict: e.target.value }))}>
                        {VERDICT_OPTIONS.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className='rounded-[24px] border border-slate-200 bg-slate-50/70 p-5'>
                    <div className='mb-4 flex items-center justify-between'>
                      <h3 className='text-lg font-semibold text-slate-900'>Inspection Checklist</h3>
                      <span className='rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary'>Rate each item</span>
                    </div>
                    <p className='mb-4 text-sm leading-7 text-slate-600'>Rate each item and add comments where faults or concerns are observed.</p>
                    <div className='space-y-4'>
                      {groupedChecklist.map((group) => (
                        <section key={group.title} className='rounded-2xl border border-slate-200 bg-white p-4'>
                          <h4 className='mb-3 text-sm font-semibold text-slate-900'>{group.title}</h4>
                          <div className='space-y-2'>
                            {group.rows.map((item, idx) => (
                              <article key={`${group.title}-${item.label}`} className='grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_auto_auto] md:items-center'>
                                <strong className='text-sm font-medium text-slate-800'>{item.label}</strong>
                                <select className='rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none' value={item.status} onChange={(e) => updateChecklist(group.title, idx, 'status', e.target.value)}>
                                  <option>Good</option>
                                  <option>Needs Attention</option>
                                  <option>Poor</option>
                                </select>
                                <input className='rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none' placeholder='Comments' value={item.note} onChange={(e) => updateChecklist(group.title, idx, 'note', e.target.value)} />
                              </article>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  </div>

                  <div className='rounded-[24px] border border-slate-200 bg-slate-50/70 p-5'>
                    <h3 className='mb-3 text-lg font-semibold text-slate-900'>Recommendation & Evidence</h3>
                    <textarea className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' placeholder='Final Recommendation' value={inspection.recommendation} onChange={(e) => setInspection((p) => ({ ...p, recommendation: e.target.value }))} />
                    <label className='mt-4 flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm font-medium text-slate-600 transition hover:border-primary hover:bg-primary/5'>
                      Upload Inspection Images (max 10)
                      <input type='file' accept='image/*' multiple onChange={(e) => uploadInspectionImages(e.target.files)} className='hidden' />
                    </label>
                    <p className='mt-3 text-sm leading-7 text-slate-600'>Tip: Use bright, sharp images of defects, VIN plate, engine bay, and tires.</p>
                    {inspection.images.length > 0 && (
                      <div className='mt-4 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3'>
                        {inspection.images.map((img, idx) => (
                          <img key={`preview-${idx}`} src={img} alt={`Inspection preview ${idx + 1}`} className='aspect-square w-full rounded-2xl border border-slate-200 object-cover' />
                        ))}
                      </div>
                    )}
                  </div>

                  <button className='w-full rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(59,130,246,0.24)] transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60' type='submit'>Save Inspection & Download PDF</button>
                </form>
              </section>
            )}

            {activeTab === 'records' && (
              <section className='rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-xl'>
                <div className='mb-5 flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-semibold uppercase tracking-[0.25em] text-primary'>Library</p>
                    <h2 className='mt-2 text-2xl font-bold text-slate-900'>Inspection Records</h2>
                  </div>
                </div>
                {loadingReports ? (
                  <p className='text-sm text-slate-600'>Loading records...</p>
                ) : reports.length === 0 ? (
                  <p className='text-sm text-slate-600'>No inspections yet.</p>
                ) : (
                  <div className='grid gap-4'>
                    {reports.map((report) => (
                      <article key={report._id} className='flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between'>
                        <div>
                          <h4 className='text-base font-semibold text-slate-900'>{report.vehicleLabel}</h4>
                          <p className='mt-1 text-sm text-slate-600'>{new Date(report.inspectedAt).toLocaleString()}</p>
                        </div>
                        <div className='flex items-center gap-3'>
                          <span className='inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary'>{report.overallVerdict}</span>
                          <button className='rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600' type='button' onClick={() => createReportPdf(report, account)}>Download PDF</button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'settings' && (
              <section className='rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-xl'>
                <div className='mb-5'>
                  <p className='text-sm font-semibold uppercase tracking-[0.25em] text-primary'>Account</p>
                  <h2 className='mt-2 text-2xl font-bold text-slate-900'>Account Settings</h2>
                  <p className='mt-2 text-sm leading-7 text-slate-600'>
                    Update your company details and signature. These details appear on your generated PDF reports.
                  </p>
                </div>
                <form className='grid gap-4 md:grid-cols-2' onSubmit={saveSettings}>
                  <input className='w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required placeholder='Full Name' value={settings.fullName} onChange={(e) => setSettings((prev) => ({ ...prev, fullName: e.target.value }))} />
                  <input className='w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required type='email' placeholder='Email' value={settings.email} onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))} />
                  <input className='w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required placeholder='WhatsApp Number' value={settings.phone} onChange={(e) => setSettings((prev) => ({ ...prev, phone: e.target.value }))} />
                  <input className='w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20' required placeholder='Company Name' value={settings.companyName} onChange={(e) => setSettings((prev) => ({ ...prev, companyName: e.target.value }))} />
                  <textarea className='w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 md:col-span-2' required placeholder='Company Address' value={settings.companyAddress} onChange={(e) => setSettings((prev) => ({ ...prev, companyAddress: e.target.value }))} />
                  <label className='flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-medium text-slate-600 transition hover:border-primary hover:bg-primary/5'>
                    Update Company Logo
                    <input type='file' accept='image/*' onChange={(e) => uploadSettingsCompanyLogo(e.target.files?.[0])} className='hidden' />
                  </label>
                  {settings.companyLogoDataUrl && <img className='h-20 w-20 rounded-2xl border border-slate-200 bg-white object-contain' src={settings.companyLogoDataUrl} alt='Updated company logo preview' />}
                  <label className='flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-medium text-slate-600 transition hover:border-primary hover:bg-primary/5'>
                    Update Signature
                    <input type='file' accept='image/*' onChange={(e) => uploadSettingsSignature(e.target.files?.[0])} className='hidden' />
                  </label>
                  {settings.signatureDataUrl && <img className='h-20 w-20 rounded-2xl border border-slate-200 bg-white object-contain' src={settings.signatureDataUrl} alt='Updated signature preview' />}
                  <button className='rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(59,130,246,0.24)] transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2' type='submit' disabled={savingSettings}>
                    {savingSettings ? 'Saving...' : 'Save Settings'}
                  </button>
                </form>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
