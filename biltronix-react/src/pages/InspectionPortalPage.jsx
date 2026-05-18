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

  if (!account) {
    return (
      <div className='min-h-screen bg-glass-bg'>
        <header className='border-b border-glass-border bg-glass-surface px-6 py-4 backdrop-blur-2xl'>
          <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 [&_h1]:m-0 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-text-primary [&_p]:mt-1 [&_p]:text-sm [&_p]:text-text-secondary'>
            <Link to='/'>Back to Home</Link>
            <div>
              <h1>Pre-Purchase Inspection App</h1>
              <p>Generate branded, professional reports your clients can trust.</p>
            </div>
          </div>
          <span className='inline-flex rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold text-primary'>Inspector Workspace</span>
        </header>

        <main className='mx-auto grid max-w-7xl grid-cols-2 items-start gap-8 px-6 py-8 max-[960px]:grid-cols-1'>
          <section className='rounded-glass border border-glass-border bg-glass-surface p-8 shadow-glass backdrop-blur-glass max-[640px]:p-5 [&_h2]:mb-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-text-primary [&_p]:leading-relaxed [&_p]:text-text-secondary [&_ul]:m-0 [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:py-2 [&_li]:text-text-secondary'>
            <h2>Professional Pre-Purchase Inspection Reports</h2>
            <p>
              Generate clean, branded, client-ready vehicle inspection reports in minutes. Your company details,
              watermark, and optional signature are included automatically.
            </p>
            <p className='rounded-xl border-l-[3px] border-primary bg-primary-50 p-4 font-medium text-primary'>
              Create a secure account once, then log in any time with your email and password to continue from your
              dashboard.
            </p>
            <ul>
              <li>Structured checklist inspired by professional inspection workflow</li>
              <li>Upload up to 10 evidence images and include all in PDF</li>
              <li>Inspector dashboard with completed records and instant downloads</li>
              <li>Company letterhead and signature area on every report</li>
            </ul>
          </section>

          <section className='rounded-glass border border-glass-border bg-glass-surface p-8 shadow-glass backdrop-blur-glass max-[640px]:p-5 [&_h3]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text-primary'>
            <h3>Access Inspection Workspace</h3>
            <p className='mb-5 text-[0.9375rem] text-text-secondary'>
              New users can create an account. Returning users should log in with their existing email and password.
            </p>
            <div className='mb-6 flex rounded-xl bg-slate-100 p-1 [&_button]:flex-1 [&_button]:cursor-pointer [&_button]:rounded-lg [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-4 [&_button]:py-2.5 [&_button]:text-[0.9375rem] [&_button]:font-medium [&_button]:text-text-secondary [&_button]:transition'>
              <button className={authMode === 'register' ? 'bg-white text-text-primary shadow-sm' : ''} onClick={() => setAuthMode('register')} type='button'>Create Account</button>
              <button className={authMode === 'login' ? 'bg-white text-text-primary shadow-sm' : ''} onClick={() => setAuthMode('login')} type='button'>Login</button>
            </div>

            {authMode === 'register' ? (
              <form className='flex flex-col gap-4 [&_button]:cursor-pointer [&_button]:rounded-xl [&_button]:border-0 [&_button]:bg-primary [&_button]:px-6 [&_button]:py-3.5 [&_button]:font-semibold [&_button]:text-white [&_button]:shadow-float [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:outline-none [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none' onSubmit={registerAccount}>
                <input required placeholder='Full Name' value={registration.fullName} onChange={(e) => setRegistration((p) => ({ ...p, fullName: e.target.value }))} />
                <input required type='email' placeholder='Email' value={registration.email} onChange={(e) => setRegistration((p) => ({ ...p, email: e.target.value }))} />
                <input required type='password' placeholder='Password' value={registration.password} onChange={(e) => setRegistration((p) => ({ ...p, password: e.target.value }))} />
                <input required type='password' placeholder='Confirm Password' value={registration.confirmPassword} onChange={(e) => setRegistration((p) => ({ ...p, confirmPassword: e.target.value }))} />
                <input required placeholder='WhatsApp Number' value={registration.phone} onChange={(e) => setRegistration((p) => ({ ...p, phone: e.target.value }))} />
                <input required placeholder='Company Name' value={registration.companyName} onChange={(e) => setRegistration((p) => ({ ...p, companyName: e.target.value }))} />
                <textarea required placeholder='Company Address' value={registration.companyAddress} onChange={(e) => setRegistration((p) => ({ ...p, companyAddress: e.target.value }))} />
                <label className='flex cursor-pointer flex-col gap-2 rounded-xl border-2 border-dashed border-slate-200 p-4 text-sm font-medium text-text-secondary transition hover:border-primary hover:bg-primary-50 [&_input]:hidden'>
                  Company Logo Upload
                  <input type='file' accept='image/*' onChange={(e) => uploadCompanyLogo(e.target.files?.[0])} />
                </label>
                {registration.companyLogoDataUrl && <img className='h-20 w-20 rounded-xl border border-slate-200 bg-slate-50 object-contain' src={registration.companyLogoDataUrl} alt='Company logo preview' />}
                <label className='flex cursor-pointer flex-col gap-2 rounded-xl border-2 border-dashed border-slate-200 p-4 text-sm font-medium text-text-secondary transition hover:border-primary hover:bg-primary-50 [&_input]:hidden'>
                  Optional Signature Upload
                  <input type='file' accept='image/*' onChange={(e) => uploadSignature(e.target.files?.[0])} />
                </label>
                {registration.signatureDataUrl && <img className='h-20 w-20 rounded-xl border border-slate-200 bg-slate-50 object-contain' src={registration.signatureDataUrl} alt='Signature preview' />}
                <button type='submit'>Create Account</button>
              </form>
            ) : (
              <>
                <form className='flex flex-col gap-4 [&_button]:cursor-pointer [&_button]:rounded-xl [&_button]:border-0 [&_button]:bg-primary [&_button]:px-6 [&_button]:py-3.5 [&_button]:font-semibold [&_button]:text-white [&_button]:shadow-float [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:outline-none [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none' onSubmit={loginAccount}>
                  <input required type='email' placeholder='Email' value={loginData.email} onChange={(e) => setLoginData((p) => ({ ...p, email: e.target.value }))} />
                  <input required type='password' placeholder='Password' value={loginData.password} onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))} />
                  <button type='submit'>Login to Dashboard</button>
                </form>
                <div className='flex flex-col gap-4 [&_button]:cursor-pointer [&_button]:rounded-xl [&_button]:border-0 [&_button]:bg-primary [&_button]:px-6 [&_button]:py-3.5 [&_button]:font-semibold [&_button]:text-white [&_button]:shadow-float [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:outline-none [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none' style={{ marginTop: 12 }}>
                  <h4 style={{ marginBottom: 8 }}>Forgot Password</h4>
                  <input
                    type='email'
                    placeholder='Your account email'
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={resetBusy}
                  />
                  <button type='button' onClick={requestPasswordReset} disabled={resetBusy}>
                    {resetBusy ? 'Please wait...' : 'Request OTP'}
                  </button>
                  <input
                    type='text'
                    placeholder='Enter OTP'
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    disabled={resetBusy}
                  />
                  <input
                    type='password'
                    placeholder='New password'
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    disabled={resetBusy}
                  />
                  <input
                    type='password'
                    placeholder='Confirm new password'
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    disabled={resetBusy}
                  />
                  <button type='button' onClick={confirmPasswordReset} disabled={resetBusy}>
                    {resetBusy ? 'Please wait...' : 'Reset Password'}
                  </button>
                </div>
              </>
            )}

            {message && <p className='mb-4 rounded-xl bg-success-light px-4 py-3 text-sm font-medium text-success'>{message}</p>}
            {error && <p className='mb-4 rounded-xl bg-error-light px-4 py-3 text-sm font-medium text-error'>{error}</p>}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-glass-bg'>
      <header className='border-b border-glass-border bg-glass-surface px-6 py-4 backdrop-blur-2xl'>
        <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 [&_h1]:m-0 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-text-primary [&_p]:mt-1 [&_p]:text-sm [&_p]:text-text-secondary'>
          <Link to='/'>Back to Home</Link>
          <div>
            <h1>Inspection Dashboard</h1>
            <p>Manage reports, review records, and export polished PDFs.</p>
          </div>
        </div>
        <span className='inline-flex rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold text-primary'>{account.companyName || 'Inspection Team'}</span>
      </header>
      <div className='mx-auto flex max-w-7xl gap-8 px-6 py-8 max-[960px]:flex-col'>
        <aside className='w-[260px] shrink-0 max-[960px]:w-full [&_h3]:m-0 [&_h3]:mb-1 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-text-primary [&_p]:m-0 [&_p]:mb-5 [&_p]:text-sm [&_p]:text-text-secondary [&_button]:mb-1 [&_button]:block [&_button]:w-full [&_button]:cursor-pointer [&_button]:rounded-xl [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-4 [&_button]:py-3 [&_button]:text-left [&_button]:text-[0.9375rem] [&_button]:font-medium [&_button]:text-text-secondary [&_button]:transition [&_button:hover]:bg-slate-100 [&_button:hover]:text-text-primary max-[960px]:[&_button]:mr-2 max-[960px]:[&_button]:inline-block max-[960px]:[&_button]:w-auto'>
          <h3>{account.companyName}</h3>
          <p>{account.fullName}</p>
          <div className='mb-5 rounded-xl bg-primary-50 p-4 text-center [&_span]:text-xs [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-text-muted [&_strong]:block [&_strong]:text-3xl [&_strong]:font-bold [&_strong]:text-primary'>
            <strong>{inspectionCount}</strong>
            <span>Inspections Completed</span>
          </div>
          <button className={activeTab === 'new' ? 'bg-primary-50 text-primary' : ''} onClick={() => setActiveTab('new')}>New Pre-Purchase Inspection</button>
          <button className={activeTab === 'records' ? 'bg-primary-50 text-primary' : ''} onClick={() => setActiveTab('records')}>Records</button>
          <button className={activeTab === 'settings' ? 'bg-primary-50 text-primary' : ''} onClick={() => setActiveTab('settings')}>Settings</button>
          <button onClick={logout}>Logout</button>
        </aside>

        <main className='min-w-0 flex-1'>
          {message && <p className='mb-4 rounded-xl bg-success-light px-4 py-3 text-sm font-medium text-success'>{message}</p>}
          {error && <p className='mb-4 rounded-xl bg-error-light px-4 py-3 text-sm font-medium text-error'>{error}</p>}

          {activeTab === 'new' && (
            <section className='mb-6 rounded-glass border border-glass-border bg-glass-surface p-8 shadow-glass backdrop-blur-glass max-[640px]:p-5 [&_h2]:mb-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-text-primary [&_h3]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text-primary [&_h4]:mb-3 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-text-primary'>
              <h2>New Pre-Purchase Inspection</h2>
              <p className='mb-6 text-[0.9375rem] text-text-secondary'>
                Complete the vehicle details, run the full checklist, attach clear photos, and generate a polished PDF
                report for your client.
              </p>
              <div className='mb-8 grid grid-cols-3 gap-4 max-[640px]:grid-cols-1 [&_article]:rounded-xl [&_article]:border [&_article]:border-glass-border [&_article]:bg-glass-surface [&_article]:p-4 [&_article]:text-center [&_span]:mb-1 [&_span]:block [&_span]:text-xs [&_span]:text-text-muted [&_strong]:text-xl [&_strong]:font-bold [&_strong]:text-text-primary'>
                <article>
                  <span>Checklist Items</span>
                  <strong>{inspection.checklist.length}</strong>
                </article>
                <article>
                  <span>Image Slots</span>
                  <strong>10 Max</strong>
                </article>
                <article>
                  <span>Report Style</span>
                  <strong>Letterhead PDF</strong>
                </article>
              </div>
              <form className='flex flex-col gap-4 [&_button]:cursor-pointer [&_button]:rounded-xl [&_button]:border-0 [&_button]:bg-primary [&_button]:px-6 [&_button]:py-3.5 [&_button]:font-semibold [&_button]:text-white [&_button]:shadow-float [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_input]:outline-none [&_select]:rounded-xl [&_select]:border [&_select]:border-glass-border [&_select]:bg-glass-surface [&_select]:px-4 [&_select]:py-3 [&_select]:outline-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:outline-none' onSubmit={submitInspection}>
                <h3>Vehicle Information</h3>
                <div className='grid grid-cols-2 gap-4 max-[640px]:grid-cols-1'>
                  <select
                    required
                    value={inspection.vehicleMake}
                    onChange={(e) => {
                      setInspection((p) => ({ ...p, vehicleMake: e.target.value, vehicleModel: '' }));
                      setCustomInspectionMake('');
                      setCustomInspectionModel('');
                    }}
                  >
                    <option value='' disabled>Vehicle Make</option>
                    {VEHICLE_MAKES.map((make) => (
                      <option key={make} value={make}>
                        {make}
                      </option>
                    ))}
                    <option value={OTHER_OPTION}>Other</option>
                  </select>
                  {inspection.vehicleMake === OTHER_OPTION && (
                    <input
                      required
                      placeholder='Enter Vehicle Make'
                      value={customInspectionMake}
                      onChange={(e) => setCustomInspectionMake(e.target.value)}
                    />
                  )}
                  <select
                    required
                    value={inspection.vehicleModel}
                    onChange={(e) => {
                      setInspection((p) => ({ ...p, vehicleModel: e.target.value }));
                      setCustomInspectionModel('');
                    }}
                    disabled={!inspection.vehicleMake || inspection.vehicleMake === OTHER_OPTION}
                  >
                    <option value='' disabled>{inspection.vehicleMake ? 'Vehicle Model' : 'Select Make First'}</option>
                    {inspectionModelOptions.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                    {inspection.vehicleMake && inspection.vehicleMake !== OTHER_OPTION && <option value={OTHER_OPTION}>Other</option>}
                  </select>
                  {(inspection.vehicleMake === OTHER_OPTION || inspection.vehicleModel === OTHER_OPTION) && (
                    <input
                      required
                      placeholder='Enter Vehicle Model'
                      value={customInspectionModel}
                      onChange={(e) => setCustomInspectionModel(e.target.value)}
                    />
                  )}
                  <input required type='number' placeholder='Year' value={inspection.year} onChange={(e) => setInspection((p) => ({ ...p, year: e.target.value }))} />
                  <input placeholder='Color' value={inspection.color} onChange={(e) => setInspection((p) => ({ ...p, color: e.target.value }))} />
                  <input
                    placeholder='VIN (17 characters)'
                    value={inspection.vin}
                    maxLength={17}
                    pattern='[A-HJ-NPR-Z0-9]{17}'
                    title='VIN must be 17 characters. Letters I, O, and Q are not allowed.'
                    onChange={(e) => setInspection((p) => ({ ...p, vin: e.target.value.toUpperCase() }))}
                  />
                  <input
                    placeholder='Registration Number (ABC-123-DE)'
                    value={inspection.regNo}
                    maxLength={12}
                    pattern='[A-Za-z]{3}-?[0-9]{3}-?[A-Za-z]{2}'
                    title='Use format like ABC-123-DE.'
                    onChange={(e) => setInspection((p) => ({ ...p, regNo: e.target.value.toUpperCase() }))}
                  />
                  <input placeholder='Mileage (km)' value={inspection.mileage} onChange={(e) => setInspection((p) => ({ ...p, mileage: e.target.value }))} />
                  <select required value={inspection.transmission} onChange={(e) => setInspection((p) => ({ ...p, transmission: e.target.value }))}>
                    <option value='' disabled>Transmission</option>
                    <option value='Automatic'>Automatic</option>
                    <option value='Manual'>Manual</option>
                  </select>
                  <select required value={inspection.fuelType} onChange={(e) => setInspection((p) => ({ ...p, fuelType: e.target.value }))}>
                    <option value='' disabled>Fuel Type</option>
                    <option value='Petrol'>Petrol</option>
                    <option value='Diesel'>Diesel</option>
                    <option value='Hybrid'>Hybrid</option>
                    <option value='Electric'>Electric</option>
                  </select>
                  <select value={inspection.overallVerdict} onChange={(e) => setInspection((p) => ({ ...p, overallVerdict: e.target.value }))}>
                    {VERDICT_OPTIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <h3>Inspection Checklist</h3>
                <p className='mb-6 text-[0.9375rem] text-text-secondary'>Rate each item and add comments where faults or concerns are observed.</p>
                {groupedChecklist.map((group) => (
                  <section key={group.title} className='mb-8 [&_h4]:mb-3 [&_h4]:rounded-xl [&_h4]:bg-primary-50 [&_h4]:px-4 [&_h4]:py-3 [&_h4]:text-primary'>
                    <h4>{group.title}</h4>
                    <div className='flex flex-col gap-2'>
                      {group.rows.map((item, idx) => (
                        <article key={`${group.title}-${item.label}`} className='grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-glass-border bg-glass-surface px-4 py-3 transition hover:bg-white/85 max-[640px]:grid-cols-1 [&_input]:w-[180px] max-[640px]:[&_input]:w-full [&_strong]:text-[0.9375rem] [&_strong]:font-medium [&_strong]:text-text-primary'>
                          <strong>{item.label}</strong>
                          <select value={item.status} onChange={(e) => updateChecklist(group.title, idx, 'status', e.target.value)}>
                            <option>Good</option>
                            <option>Needs Attention</option>
                            <option>Poor</option>
                          </select>
                          <input placeholder='Comments' value={item.note} onChange={(e) => updateChecklist(group.title, idx, 'note', e.target.value)} />
                        </article>
                      ))}
                    </div>
                  </section>
                ))}

                <textarea placeholder='Final Recommendation' value={inspection.recommendation} onChange={(e) => setInspection((p) => ({ ...p, recommendation: e.target.value }))} />

                <label className='flex cursor-pointer flex-col gap-2 rounded-xl border-2 border-dashed border-slate-200 p-4 text-sm font-medium text-text-secondary transition hover:border-primary hover:bg-primary-50 [&_input]:hidden'>
                  Upload Inspection Images (max 10)
                  <input type='file' accept='image/*' multiple onChange={(e) => uploadInspectionImages(e.target.files)} />
                </label>
                <p className='mb-6 text-[0.9375rem] text-text-secondary'>Tip: Use bright, sharp images of defects, VIN plate, engine bay, and tires.</p>
                {inspection.images.length > 0 && (
                  <div className='grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 [&_img]:aspect-square [&_img]:w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-slate-200 [&_img]:object-cover'>
                    {inspection.images.map((img, idx) => (
                      <img key={`preview-${idx}`} src={img} alt={`Inspection preview ${idx + 1}`} />
                    ))}
                  </div>
                )}

                <button className='cursor-pointer rounded-xl border-0 bg-primary px-6 py-3.5 font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60' type='submit'>Save Inspection & Download PDF</button>
              </form>
            </section>
          )}

          {activeTab === 'records' && (
            <section className='mb-6 rounded-glass border border-glass-border bg-glass-surface p-8 shadow-glass backdrop-blur-glass max-[640px]:p-5 [&_h2]:mb-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-text-primary [&_h3]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text-primary [&_h4]:mb-3 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-text-primary'>
              <h2>Inspection Records</h2>
              {loadingReports ? (
                <p>Loading records...</p>
              ) : reports.length === 0 ? (
                <p>No inspections yet.</p>
              ) : (
                <div className='grid gap-4'>
                  {reports.map((report) => (
                    <article key={report._id} className='flex items-center justify-between gap-4 rounded-xl border border-glass-border bg-glass-surface p-5 max-[640px]:flex-col max-[640px]:items-start [&_p]:m-0 [&_p]:text-sm [&_p]:text-text-muted'>
                      <div className='[&_h4]:m-0 [&_h4]:text-base [&_h4]:text-text-primary'>
                        <h4>{report.vehicleLabel}</h4>
                        <span className='inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary'>{report.overallVerdict}</span>
                      </div>
                      <p>{new Date(report.inspectedAt).toLocaleString()}</p>
                      <button className='cursor-pointer rounded-xl border-0 bg-primary px-6 py-3.5 font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60' type='button' onClick={() => createReportPdf(report, account)}>Download PDF</button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'settings' && (
            <section className='mb-6 rounded-glass border border-glass-border bg-glass-surface p-8 shadow-glass backdrop-blur-glass max-[640px]:p-5 [&_h2]:mb-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-text-primary [&_h3]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text-primary [&_h4]:mb-3 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-text-primary'>
              <h2>Account Settings</h2>
              <p className='mb-6 text-[0.9375rem] text-text-secondary'>
                Update your company details and signature. These details appear on your generated PDF reports.
              </p>
              <form className='grid grid-cols-2 gap-4 max-[640px]:grid-cols-1 [&_button]:cursor-pointer [&_button]:rounded-xl [&_button]:border-0 [&_button]:bg-primary [&_button]:px-6 [&_button]:py-3.5 [&_button]:font-semibold [&_button]:text-white [&_button]:shadow-float [&_input]:rounded-xl [&_input]:border [&_input]:border-glass-border [&_input]:bg-glass-surface [&_input]:px-4 [&_input]:py-3 [&_textarea]:col-span-2 [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-glass-border [&_textarea]:bg-glass-surface [&_textarea]:px-4 [&_textarea]:py-3 max-[640px]:[&_textarea]:col-span-1' onSubmit={saveSettings}>
                <input required placeholder='Full Name' value={settings.fullName} onChange={(e) => setSettings((prev) => ({ ...prev, fullName: e.target.value }))} />
                <input required type='email' placeholder='Email' value={settings.email} onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))} />
                <input required placeholder='WhatsApp Number' value={settings.phone} onChange={(e) => setSettings((prev) => ({ ...prev, phone: e.target.value }))} />
                <input required placeholder='Company Name' value={settings.companyName} onChange={(e) => setSettings((prev) => ({ ...prev, companyName: e.target.value }))} />
                <textarea required placeholder='Company Address' value={settings.companyAddress} onChange={(e) => setSettings((prev) => ({ ...prev, companyAddress: e.target.value }))} />
                <label className='flex cursor-pointer flex-col gap-2 rounded-xl border-2 border-dashed border-slate-200 p-4 text-sm font-medium text-text-secondary transition hover:border-primary hover:bg-primary-50 [&_input]:hidden'>
                  Update Company Logo
                  <input type='file' accept='image/*' onChange={(e) => uploadSettingsCompanyLogo(e.target.files?.[0])} />
                </label>
                {settings.companyLogoDataUrl && <img className='h-20 w-20 rounded-xl border border-slate-200 bg-slate-50 object-contain' src={settings.companyLogoDataUrl} alt='Updated company logo preview' />}
                <label className='flex cursor-pointer flex-col gap-2 rounded-xl border-2 border-dashed border-slate-200 p-4 text-sm font-medium text-text-secondary transition hover:border-primary hover:bg-primary-50 [&_input]:hidden'>
                  Update Signature
                  <input type='file' accept='image/*' onChange={(e) => uploadSettingsSignature(e.target.files?.[0])} />
                </label>
                {settings.signatureDataUrl && <img className='h-20 w-20 rounded-xl border border-slate-200 bg-slate-50 object-contain' src={settings.signatureDataUrl} alt='Updated signature preview' />}
                <button className='cursor-pointer rounded-xl border-0 bg-primary px-6 py-3.5 font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60' type='submit' disabled={savingSettings}>
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
