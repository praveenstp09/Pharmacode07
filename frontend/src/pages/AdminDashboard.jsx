import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PCI_CURRICULUM, QUICK_REVISION_SUBJECTS } from './StudyMaterials';

const AdminDashboard = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'series', 'materials', 'singleModels', 'nonPharma', 'coupons', 'orders', 'students'
  const [stats, setStats] = useState(null);
  const [seriesList, setSeriesList] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [singleModelsList, setSingleModelsList] = useState([]);
  const [nonPharmaList, setNonPharmaList] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [students, setStudents] = useState([]);
  const [contactsList, setContactsList] = useState([]);
  const [contactFilter, setContactFilter] = useState('all'); // 'all', 'pending', 'resolved'
  const [loading, setLoading] = useState(true);

  // File Upload State
  const [uploadingFile, setUploadingFile] = useState(false);

  // 1. New Test Series Form State
  const [newSeries, setNewSeries] = useState({
    title: '',
    slug: '',
    examType: 'GSSSB',
    category: 'Competitive Exam',
    price: 499,
    discountPrice: 199,
    validityDays: 365,
    description: '',
    thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
  });

  // 2. Folder Item Form State (for selected Series)
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [folderForm, setFolderForm] = useState({
    folderType: 'cbt_mixed',
    contentType: 'cbt',
    title: '',
    subjectName: 'Pharmacology',
    pdfUrl: '',
    year: 2026,
    isFreeDemo: false,
    durationMinutes: 120,
    totalMarks: 120,
  });
  const [folderQuestionsQueue, setFolderQuestionsQueue] = useState([]);

  // 3. New Study Material Form State
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    courseType: 'B.Pharm',
    semesterOrYear: 'Semester 1',
    subject: 'Human Anatomy and Physiology I',
    customSubject: '',
    chapter: '',
    materialType: 'chapter_notes',
    description: '',
    fileUrl: '',
    isCustomExam: false,
    customExamName: '',
  });

  // 4. New Single Model Paper Form State
  const [newSingleModel, setNewSingleModel] = useState({
    title: '',
    examType: 'AIIMS',
    description: '',
    hasCBT: true,
    hasPdf: true,
    pdfUrl: '',
    price: 49,
    discountPrice: 29,
    isFree: false,
    durationMinutes: 100,
  });
  const [singleModelQuestions, setSingleModelQuestions] = useState([]);

  // 5. New Non-Pharma Resource Form State
  const [newNonPharma, setNewNonPharma] = useState({
    title: '',
    section: 'reasoning',
    topic: '',
    contentType: 'cbt',
    pdfUrl: '',
    relevanceMonth: 'August 2026',
    isFree: true,
    price: 0,
    durationMinutes: 30,
  });
  const [nonPharmaQuestions, setNonPharmaQuestions] = useState([]);

  // 6. New Coupon Form State
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountPercent: 10,
    maxDiscount: 100,
    minOrderValue: 99,
    expiryDays: 30,
  });

  const bPharmOptions = [
    'Semester 1',
    'Semester 2',
    'Semester 3',
    'Semester 4',
    'Semester 5',
    'Semester 6',
    'Semester 7',
    'Semester 8',
  ];

  const dPharmOptions = ['1st Year', '2nd Year'];


  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [isAdmin, authLoading, activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats' || !stats) {
        const statsRes = await api.get('/admin/stats');
        if (statsRes.data.success) setStats(statsRes.data.data);
      }

      if (activeTab === 'series') {
        const sRes = await api.get('/test-series');
        if (sRes.data.success) {
          setSeriesList(sRes.data.data);
          if (!selectedSeriesId && sRes.data.data.length > 0) {
            setSelectedSeriesId(sRes.data.data[0]._id);
          }
        }
      }

      if (activeTab === 'materials') {
        const mRes = await api.get('/materials');
        if (mRes.data.success) setMaterialsList(mRes.data.data);
      }

      if (activeTab === 'singleModels') {
        const smRes = await api.get('/single-models');
        if (smRes.data.success) setSingleModelsList(smRes.data.data);
      }

      if (activeTab === 'nonPharma') {
        const npRes = await api.get('/non-pharma');
        if (npRes.data.success) setNonPharmaList(npRes.data.data);
      }

      if (activeTab === 'coupons') {
        const cRes = await api.get('/admin/coupons');
        if (cRes.data.success) setCoupons(cRes.data.data);
      }

      if (activeTab === 'orders') {
        const oRes = await api.get('/admin/orders');
        if (oRes.data.success) setOrders(oRes.data.data);
      }

      if (activeTab === 'students') {
        const stRes = await api.get('/admin/students');
        if (stRes.data.success) setStudents(stRes.data.data);
      }

      if (activeTab === 'contacts' || !contactsList.length) {
        const cRes = await api.get('/admin/contacts');
        if (cRes.data.success) setContactsList(cRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // File upload handler
  const handleFileUpload = async (e, setTargetUrl) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'pharmacode_docs');

    setUploadingFile(true);
    try {
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const url = res.data.data.url;
        setTargetUrl(url);
        showToast('File uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast('Upload failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  // Smart MCQ Regex Parser
  const parseBulkMcqText = (text, setQueueState, defaultSubject = 'General Pharmacy') => {
    if (!text.trim()) {
      showToast('Please paste some MCQ text first!', 'warning');
      return;
    }
    const blocks = text.split(/(?=Q\d+[\.\:\s])/i).filter(b => b.trim().length > 0);
    const parsedList = [];

    blocks.forEach(b => {
      const qMatch = b.match(/Q\d+[\.\:\s]+([\s\S]+?)(?=\n\s*[A-D]\.|\n\s*A\))/i);
      const optAMatch = b.match(/(?:^|\n)\s*A[\.\)]\s*([^\n]+)/i);
      const optBMatch = b.match(/(?:^|\n)\s*B[\.\)]\s*([^\n]+)/i);
      const optCMatch = b.match(/(?:^|\n)\s*C[\.\)]\s*([^\n]+)/i);
      const optDMatch = b.match(/(?:^|\n)\s*D[\.\)]\s*([^\n]+)/i);
      const ansMatch = b.match(/(?:Correct Answer|Answer|Ans)[\s\:\-]+([A-D])/i);
      const expMatch = b.match(/(?:Explanation|Sol)[\s\:\(\)\w]*\n*([\s\S]+)$/i);

      if (qMatch && optAMatch && optBMatch) {
        const correctLetter = ansMatch ? ansMatch[1].toUpperCase() : 'A';
        const correctIdx = correctLetter === 'A' ? 0 : correctLetter === 'B' ? 1 : correctLetter === 'C' ? 2 : 3;

        parsedList.push({
          questionText: qMatch[1].replace(/\n+/g, ' ').trim(),
          options: [
            optAMatch ? optAMatch[1].trim() : '',
            optBMatch ? optBMatch[1].trim() : '',
            optCMatch ? optCMatch[1].trim() : '',
            optDMatch ? optDMatch[1].trim() : '',
          ],
          correctOptionIndex: correctIdx,
          explanation: expMatch ? expMatch[1].replace(/\n+/g, ' ').trim() : 'Official answer key reference.',
          subject: defaultSubject || 'General Pharmacy',
        });
      }
    });

    if (parsedList.length === 0) {
      showToast('Could not detect MCQ format. Please make sure text has Q1., A., B., C., D. and Correct Answer.', 'warning');
      return;
    }

    setQueueState(prev => [...prev, ...parsedList]);
    showToast(`Successfully parsed ${parsedList.length} questions into queue!`, 'success');
  };

  const handleCreateSeries = async e => {
    e.preventDefault();
    try {
      const slug =
        newSeries.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') +
        '-' + Date.now();
      const res = await api.post('/admin/test-series', { ...newSeries, slug });
      if (res.data.success) {
        showToast('Test Series Package created successfully!', 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to create series: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleAddFolderItem = async e => {
    e.preventDefault();
    if (!selectedSeriesId) {
      showToast('Please select a Test Series first!', 'warning');
      return;
    }
    try {
      const res = await api.post(`/admin/test-series/${selectedSeriesId}/folders`, {
        ...folderForm,
        questions: folderForm.contentType === 'cbt' ? folderQuestionsQueue : [],
      });
      if (res.data.success) {
        showToast('Item added to folder successfully!', 'success');
        setFolderQuestionsQueue([]);
        setFolderForm({ ...folderForm, title: '', pdfUrl: '' });
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleCreateMaterial = async e => {
    e.preventDefault();
    try {
      // Determine final semesterOrYear and subject
      const finalSemesterOrYear =
        newMaterial.courseType === 'Exam' && newMaterial.isCustomExam
          ? newMaterial.customExamName
          : newMaterial.semesterOrYear;

      const finalSubject =
        newMaterial.subject === 'CUSTOM'
          ? newMaterial.customSubject
          : newMaterial.subject;

      if (!finalSemesterOrYear) {
        showToast('Please specify the semester, year, or exam name', 'warning');
        return;
      }

      if (!finalSubject) {
        showToast('Please specify the subject', 'warning');
        return;
      }

      const slug =
        newMaterial.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') +
        '-' + Date.now();

      const res = await api.post('/admin/materials', {
        ...newMaterial,
        description: newMaterial.description || newMaterial.title || 'Pharmacy Study Notes and PYQ Paper',
        semesterOrYear: finalSemesterOrYear,
        subject: finalSubject,
        slug,
      });

      if (res.data.success) {
        showToast('Study Material uploaded successfully!', 'success');
        setNewMaterial({
          ...newMaterial,
          title: '',
          chapter: '',
          fileUrl: '',
          customSubject: '',
          customExamName: '',
        });
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDeleteMaterial = async id => {
    if (!window.confirm('Are you sure you want to delete this study material?')) return;
    try {
      const res = await api.delete(`/admin/materials/${id}`);
      if (res.data.success) {
        showToast('Study Material deleted successfully!', 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to delete: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleCreateSingleModel = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/single-models', {
        ...newSingleModel,
        questions: newSingleModel.hasCBT ? singleModelQuestions : [],
      });
      if (res.data.success) {
        showToast('Single Model Paper created successfully!', 'success');
        setSingleModelQuestions([]);
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleCreateNonPharma = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/non-pharma', {
        ...newNonPharma,
        questions: newNonPharma.contentType === 'cbt' ? nonPharmaQuestions : [],
      });
      if (res.data.success) {
        showToast('Non-Pharma Resource created successfully!', 'success');
        setNonPharmaQuestions([]);
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleCreateCoupon = async e => {
    e.preventDefault();
    try {
      const expiryDate = new Date(
        Date.now() + (Number(newCoupon.expiryDays) || 30) * 24 * 60 * 60 * 1000
      );
      const res = await api.post('/admin/coupons', {
        ...newCoupon,
        expiryDate,
      });
      if (res.data.success) {
        showToast('Promo Code created successfully!', 'success');
        setNewCoupon({ code: '', discountPercent: 10, maxDiscount: 100, minOrderValue: 99, expiryDays: 30 });
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to create coupon: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDeleteCoupon = async id => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      const res = await api.delete(`/admin/coupons/${id}`);
      if (res.data.success) {
        showToast('Coupon deleted successfully', 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to delete coupon: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleToggleResolve = async (contactId) => {
    try {
      const res = await api.put(`/admin/contacts/${contactId}/resolve`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setContactsList(prev =>
          prev.map(c => (c._id === contactId ? res.data.data : c))
        );
        return;
      }
    } catch (err) {
      try {
        const fallbackRes = await api.put(`/contact/${contactId}/resolve`);
        if (fallbackRes.data.success) {
          showToast(fallbackRes.data.message, 'success');
          setContactsList(prev =>
            prev.map(c => (c._id === contactId ? fallbackRes.data.data : c))
          );
          return;
        }
      } catch (fErr) {
        showToast('Failed to update inquiry status: ' + (err.response?.data?.message || err.message), 'error');
      }
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this student inquiry?')) return;
    try {
      const res = await api.delete(`/admin/contacts/${contactId}`);
      if (res.data.success) {
        showToast('Inquiry deleted successfully', 'info');
        setContactsList(prev => prev.filter(c => c._id !== contactId));
        return;
      }
    } catch (err) {
      try {
        const fDel = await api.delete(`/contact/${contactId}`);
        if (fDel.data.success) {
          showToast('Inquiry deleted successfully', 'info');
          setContactsList(prev => prev.filter(c => c._id !== contactId));
          return;
        }
      } catch (fErr) {
        showToast('Failed to delete inquiry: ' + (err.response?.data?.message || err.message), 'error');
      }
    }
  };

  // Compute standard subjects for current Course & Semester/Year selection
  const standardSubjects =
    PCI_CURRICULUM[newMaterial.courseType]?.[newMaterial.semesterOrYear] || [];

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              PharmaCode07 Admin Studio
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Manage Test Series, B/D.Pharm Notes, Model Papers & Coupons
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'stats', label: '📊 Stats' },
          { id: 'series', label: '📁 Pillar 1: Test Series' },
          { id: 'materials', label: '🎓 Pillar 2: Study Notes Studio' },
          { id: 'singleModels', label: '🎯 Pillar 3: Model Papers' },
          { id: 'nonPharma', label: '🧠 Pillar 4: Non-Pharma' },
          { id: 'coupons', label: '🏷️ Coupons & Promos' },
          { id: 'orders', label: '💳 Orders' },
          { id: 'students', label: '👥 Students' },
          { id: 'contacts', label: `💬 Student Inquiries (${contactsList.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: RICH ANALYTICS DASHBOARD */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-8">
          {/* ── ROW 1: Hero KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Students', value: stats.totalStudents, icon: '👥', color: 'blue', sub: `+${stats.registrationTrend?.slice(-1)?.[0]?.count || 0} today` },
              { label: 'Total Revenue', value: `₹${stats.totalRevenue?.toLocaleString('en-IN')}`, icon: '💰', color: 'emerald', sub: `${stats.totalOrders} completed orders` },
              { label: 'CBT Attempts', value: stats.totalAttempts, icon: '📝', color: 'violet', sub: `+${stats.attemptsTrend?.slice(-1)?.[0]?.count || 0} today` },
              { label: 'Content Items', value: (stats.contentInventory?.folderItems || 0) + (stats.contentInventory?.studyMaterials || 0) + (stats.contentInventory?.singleModelPapers || 0) + (stats.contentInventory?.nonPharmaResources || 0), icon: '📦', color: 'amber', sub: `${stats.totalSeries} series packs` },
            ].map((kpi, idx) => (
              <div key={idx} className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                    <div className={`text-2xl sm:text-3xl font-extrabold mt-1 text-${kpi.color}-600`}>{kpi.value}</div>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1 block">{kpi.sub}</span>
                  </div>
                  <span className="text-2xl">{kpi.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── ROW 2: 7-Day Interactive Graph Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Registration Trend Graph */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-sm">
                    📈
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">New Registrations</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">Last 7 Days Trend</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-xl">
                  {stats.registrationTrend?.reduce((s, d) => s + d.count, 0) || 0} total
                </span>
              </div>

              {/* Bar Chart Area */}
              <div className="pt-2">
                <div className="flex items-end justify-between gap-2 h-32 px-2 pb-2 bg-slate-50/80 rounded-2xl border border-slate-100">
                  {(stats.registrationTrend || []).map((d, i) => {
                    const maxVal = Math.max(...(stats.registrationTrend || []).map(x => x.count), 1);
                    const pct = d.count > 0 ? Math.max((d.count / maxVal) * 85, 20) : 4;
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                        <span className={`text-[10px] font-extrabold mb-1 transition ${
                          d.count > 0 ? 'text-blue-600 font-bold' : 'text-slate-300'
                        }`}>
                          {d.count}
                        </span>
                        <div
                          className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                            d.count > 0
                              ? 'bg-gradient-to-t from-blue-600 to-indigo-400 shadow-sm group-hover:from-blue-700 group-hover:to-indigo-500'
                              : 'bg-slate-200'
                          }`}
                          style={{ height: `${pct}%` }}
                          title={`${d.label}: ${d.count} registrations`}
                        />
                        <span className="text-[10px] text-slate-500 font-semibold mt-1.5 whitespace-nowrap">
                          {d.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Revenue Trend Graph */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-sm">
                    💰
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Daily Revenue</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">Last 7 Days (₹)</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-xl">
                  ₹{stats.revenueTrend?.reduce((s, d) => s + d.amount, 0)?.toLocaleString('en-IN') || 0}
                </span>
              </div>

              {/* Bar Chart Area */}
              <div className="pt-2">
                <div className="flex items-end justify-between gap-2 h-32 px-2 pb-2 bg-slate-50/80 rounded-2xl border border-slate-100">
                  {(stats.revenueTrend || []).map((d, i) => {
                    const maxVal = Math.max(...(stats.revenueTrend || []).map(x => x.amount), 1);
                    const pct = d.amount > 0 ? Math.max((d.amount / maxVal) * 85, 20) : 4;
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                        <span className={`text-[10px] font-extrabold mb-1 transition truncate max-w-full ${
                          d.amount > 0 ? 'text-emerald-600 font-bold' : 'text-slate-300'
                        }`}>
                          {d.amount > 0 ? `₹${d.amount}` : '0'}
                        </span>
                        <div
                          className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                            d.amount > 0
                              ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-sm group-hover:from-emerald-700 group-hover:to-teal-500'
                              : 'bg-slate-200'
                          }`}
                          style={{ height: `${pct}%` }}
                          title={`${d.label}: ₹${d.amount}`}
                        />
                        <span className="text-[10px] text-slate-500 font-semibold mt-1.5 whitespace-nowrap">
                          {d.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CBT Attempts Trend Graph */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-extrabold text-sm">
                    📝
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">CBT Attempts</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">Last 7 Days Submissions</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-violet-700 bg-violet-50 border border-violet-200/60 px-2.5 py-1 rounded-xl">
                  {stats.attemptsTrend?.reduce((s, d) => s + d.count, 0) || 0} tests
                </span>
              </div>

              {/* Bar Chart Area */}
              <div className="pt-2">
                <div className="flex items-end justify-between gap-2 h-32 px-2 pb-2 bg-slate-50/80 rounded-2xl border border-slate-100">
                  {(stats.attemptsTrend || []).map((d, i) => {
                    const maxVal = Math.max(...(stats.attemptsTrend || []).map(x => x.count), 1);
                    const pct = d.count > 0 ? Math.max((d.count / maxVal) * 85, 20) : 4;
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                        <span className={`text-[10px] font-extrabold mb-1 transition ${
                          d.count > 0 ? 'text-violet-600 font-bold' : 'text-slate-300'
                        }`}>
                          {d.count}
                        </span>
                        <div
                          className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                            d.count > 0
                              ? 'bg-gradient-to-t from-violet-600 to-purple-400 shadow-sm group-hover:from-violet-700 group-hover:to-purple-500'
                              : 'bg-slate-200'
                          }`}
                          style={{ height: `${pct}%` }}
                          title={`${d.label}: ${d.count} tests taken`}
                        />
                        <span className="text-[10px] text-slate-500 font-semibold mt-1.5 whitespace-nowrap">
                          {d.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 3: Recent Users + Content Inventory ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Users */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-800">👥 Recently Joined Students</h4>
                <button onClick={() => setActiveTab('students')} className="text-[10px] text-blue-600 font-bold hover:underline">
                  View All →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                    <tr>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Mobile</th>
                      <th className="p-2.5">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(stats.latestUsers || []).map(u => (
                      <tr key={u._id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-900 flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-[10px] flex-shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.name}</span>
                        </td>
                        <td className="p-2.5 text-slate-600">{u.email}</td>
                        <td className="p-2.5 font-mono text-slate-500">{u.mobile || '—'}</td>
                        <td className="p-2.5 text-slate-400 font-semibold">
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Content Inventory Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-sm font-extrabold text-slate-800">📦 Content Inventory</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Test Series Packs', count: stats.contentInventory?.testSeriesPacks || 0, color: 'bg-indigo-500', emoji: '📁' },
                    { label: '4-Folder Items', count: stats.contentInventory?.folderItems || 0, color: 'bg-blue-500', emoji: '📄' },
                    { label: 'Study Materials', count: stats.contentInventory?.studyMaterials || 0, color: 'bg-emerald-500', emoji: '🎓' },
                    { label: 'Model Papers', count: stats.contentInventory?.singleModelPapers || 0, color: 'bg-amber-500', emoji: '🎯' },
                    { label: 'Non-Pharma Quizzes', count: stats.contentInventory?.nonPharmaResources || 0, color: 'bg-violet-500', emoji: '🧠' },
                    { label: 'CBT Test Papers', count: stats.contentInventory?.totalCBTPapers || 0, color: 'bg-rose-500', emoji: '📝' },
                  ].map((item, i) => {
                    const totalContent =
                      (stats.contentInventory?.testSeriesPacks || 0) +
                      (stats.contentInventory?.folderItems || 0) +
                      (stats.contentInventory?.studyMaterials || 0) +
                      (stats.contentInventory?.singleModelPapers || 0) +
                      (stats.contentInventory?.nonPharmaResources || 0) +
                      (stats.contentInventory?.totalCBTPapers || 0);
                    const pct = totalContent ? Math.round((item.count / totalContent) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center space-x-3">
                        <span className="text-base">{item.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-slate-700">{item.label}</span>
                            <span className="text-[11px] font-extrabold text-slate-900">{item.count}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full">
                            <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Study Material Breakdown Mini */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-sm font-extrabold text-slate-800">🎓 Study Notes Breakdown</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'B.Pharm', count: stats.studyBreakdown?.bPharmCount || 0, color: 'bg-blue-100 text-blue-700' },
                    { label: 'D.Pharm', count: stats.studyBreakdown?.dPharmCount || 0, color: 'bg-emerald-100 text-emerald-700' },
                    { label: 'Exam Notes', count: stats.studyBreakdown?.examNotesCount || 0, color: 'bg-amber-100 text-amber-700' },
                  ].map((b, i) => (
                    <div key={i} className={`rounded-xl p-3 text-center ${b.color}`}>
                      <div className="text-xl font-extrabold">{b.count}</div>
                      <div className="text-[10px] font-bold mt-0.5">{b.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 4: Top Series + Recent Orders + Recent Attempts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Performing Test Series */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-sm font-extrabold text-slate-800">🏆 Top Test Series Packs</h4>
              <div className="space-y-3">
                {(stats.topSeries || []).map((s, idx) => (
                  <div key={s._id} className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-xl">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold text-white ${
                      idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-700' : 'bg-slate-300'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{s.title}</p>
                      <p className="text-[10px] text-slate-500">{s.examType} • ₹{s.discountPrice || s.price}</p>
                    </div>
                    <span className="text-xs font-extrabold text-blue-600">{s.enrolledCount || 0} enrolled</span>
                  </div>
                ))}
                {(!stats.topSeries || stats.topSeries.length === 0) && (
                  <p className="text-xs text-slate-400 text-center py-4">No test series created yet.</p>
                )}
              </div>
            </div>

            {/* Recent Orders Feed */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-800">💳 Recent Orders</h4>
                <button onClick={() => setActiveTab('orders')} className="text-[10px] text-blue-600 font-bold hover:underline">
                  View All →
                </button>
              </div>
              <div className="space-y-2">
                {(stats.recentOrders || []).map(o => (
                  <div key={o._id} className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{o.userId?.name || 'Student'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{o.orderId?.slice(0, 12) || '...'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-emerald-600">₹{o.totalAmount}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        o.paymentStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
                {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                  <p className="text-xs text-slate-400 text-center py-4">No orders yet.</p>
                )}
              </div>
            </div>

            {/* Recent CBT Attempts */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-sm font-extrabold text-slate-800">📝 Latest CBT Attempts</h4>
              <div className="space-y-2">
                {(stats.recentAttempts || []).map(a => (
                  <div key={a._id} className="p-2.5 bg-slate-50/70 rounded-xl text-xs space-y-0.5">
                    <p className="font-bold text-slate-800">{a.userId?.name || 'Student'}</p>
                    <p className="text-[10px] text-blue-600 font-semibold truncate">{a.testPaperId?.title || a.testSeriesId?.title || 'CBT Test'}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] font-bold text-emerald-600">
                        {a.score !== undefined ? `${a.score}/${a.totalMarks || '—'}` : '—'}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {a.completedAt ? new Date(a.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                      </span>
                    </div>
                  </div>
                ))}
                {(!stats.recentAttempts || stats.recentAttempts.length === 0) && (
                  <p className="text-xs text-slate-400 text-center py-4">No attempts yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── ROW 5: Quick Action Secondary KPIs ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'Admins', value: stats.totalAdmins || 1, emoji: '🛡️', bg: 'bg-slate-100' },
              { label: 'CBT Papers', value: stats.totalPapers, emoji: '📋', bg: 'bg-blue-50' },
              { label: 'Coupons', value: stats.totalCoupons || 0, emoji: '🏷️', bg: 'bg-violet-50' },
              { label: 'Paid Orders', value: stats.totalOrders, emoji: '✅', bg: 'bg-emerald-50' },
              { label: 'Series Packs', value: stats.totalSeries, emoji: '📁', bg: 'bg-indigo-50' },
              { label: 'Study PDFs', value: stats.contentInventory?.studyMaterials || 0, emoji: '📚', bg: 'bg-amber-50' },
            ].map((kpi, i) => (
              <div key={i} className={`${kpi.bg} p-4 rounded-2xl text-center`}>
                <span className="text-xl">{kpi.emoji}</span>
                <div className="text-lg font-extrabold text-slate-900 mt-1">{kpi.value}</div>
                <div className="text-[10px] font-bold text-slate-500 mt-0.5">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PILLAR 1 - TEST SERIES 4-FOLDERS MANAGER */}
      {activeTab === 'series' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Create New Test Series Package</h3>
            <form onSubmit={handleCreateSeries} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700">Package Title</label>
                <input
                  type="text"
                  required
                  value={newSeries.title}
                  onChange={e => setNewSeries({ ...newSeries, title: e.target.value })}
                  placeholder="e.g. AIIMS Pharmacist 2026 4-Folder Prep Pack"
                  className="w-full mt-1 p-2.5 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Exam Type</label>
                  <input
                    type="text"
                    required
                    value={newSeries.examType}
                    onChange={e => setNewSeries({ ...newSeries, examType: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Validity (Days)</label>
                  <input
                    type="number"
                    value={newSeries.validityDays}
                    onChange={e => setNewSeries({ ...newSeries, validityDays: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={newSeries.price}
                    onChange={e => setNewSeries({ ...newSeries, price: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={newSeries.discountPrice}
                    onChange={e => setNewSeries({ ...newSeries, discountPrice: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl font-bold text-emerald-600"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={newSeries.description}
                  onChange={e => setNewSeries({ ...newSeries, description: e.target.value })}
                  className="w-full mt-1 p-2.5 border rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow"
              >
                Create Package
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Add Content Item to Package Folders</h3>
              <p className="text-xs text-slate-500">Select which folder this CBT or PDF belongs to.</p>
            </div>

            <form onSubmit={handleAddFolderItem} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700">Select Target Package</label>
                <select
                  value={selectedSeriesId}
                  onChange={e => setSelectedSeriesId(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-xl font-bold bg-slate-50"
                >
                  {seriesList.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.title} ({s.examType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Target Folder</label>
                  <select
                    value={folderForm.folderType}
                    onChange={e => setFolderForm({ ...folderForm, folderType: e.target.value, contentType: 'cbt' })}
                    className="w-full mt-1 p-2.5 border rounded-xl font-bold"
                  >
                    <option value="cbt_mixed">📁 Folder 1: Full CBT Mock Tests (CBT Exam)</option>
                    <option value="pyq">📁 Folder 2: Past PYQs (CBT Exam + Solved PDF)</option>
                    <option value="subject_wise">📁 Folder 3: Subject-Wise Tests (CBT Exam Only)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Exam Mode</label>
                  <div className="w-full mt-1 p-2.5 bg-slate-50 border rounded-xl font-bold text-xs text-slate-700 flex items-center space-x-1.5">
                    <span>⚡</span>
                    <span>
                      {folderForm.folderType === 'pyq'
                        ? 'Dual Mode (Interactive CBT + Solved PDF)'
                        : 'Interactive Online CBT Simulator'}
                    </span>
                  </div>
                </div>
              </div>

              {folderForm.folderType === 'subject_wise' && (
                <div>
                  <label className="font-bold text-slate-700">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={folderForm.subjectName}
                    onChange={e => setFolderForm({ ...folderForm, subjectName: e.target.value })}
                    placeholder="e.g. Pharmacology, Pharmaceutics, Pharmaceutical Chemistry"
                    className="w-full mt-1 p-2.5 border rounded-xl font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700">Item Title</label>
                <input
                  type="text"
                  required
                  value={folderForm.title}
                  onChange={e => setFolderForm({ ...folderForm, title: e.target.value })}
                  placeholder="e.g. AIIMS Pharmacist Model CBT 1 or 2023 Solved Paper"
                  className="w-full mt-1 p-2.5 border rounded-xl font-bold"
                />
              </div>

              <div className="flex items-center space-x-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <input
                  type="checkbox"
                  id="demo-check"
                  checked={folderForm.isFreeDemo}
                  onChange={e => setFolderForm({ ...folderForm, isFreeDemo: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="demo-check" className="text-xs font-bold text-emerald-900 cursor-pointer">
                  🟢 Set as Free Demo (Unlocked for all students to preview)
                </label>
              </div>

              {/* PDF Document Section (Enabled for PYQ Folder) */}
              {folderForm.folderType === 'pyq' && (
                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-indigo-950 text-xs flex items-center space-x-1.5">
                      <span>📄 Solved Official Question Paper PDF</span>
                      <span className="text-[10px] text-indigo-600 font-normal">(Optional if uploading CBT questions)</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={e => handleFileUpload(e, url => setFolderForm({ ...folderForm, pdfUrl: url }))}
                      className="text-xs"
                    />
                    {uploadingFile && <span className="text-xs text-blue-600 font-bold animate-pulse">Uploading...</span>}
                  </div>
                  <input
                    type="text"
                    value={folderForm.pdfUrl}
                    onChange={e => setFolderForm({ ...folderForm, pdfUrl: e.target.value })}
                    placeholder="Or paste direct PDF URL..."
                    className="w-full p-2 border rounded-xl text-xs font-mono bg-white"
                  />
                </div>
              )}

              {/* CBT MCQ Questions Parser (For CBT Mock, PYQ CBT mode, and Subject-Wise) */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900">⚡ Bulk MCQ Text Parser (CBT Simulator Mode)</span>
                  <span className="text-xs font-bold text-emerald-700">Queue: {folderQuestionsQueue.length} MCQs</span>
                </div>
                <textarea
                  rows={4}
                  id="folder-mcq-text"
                  placeholder="Paste Q1. A. B. C. D. Correct Answer: ... text copied from PDF..."
                  className="w-full p-2.5 bg-white border rounded-xl text-xs font-mono"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const txt = document.getElementById('folder-mcq-text').value;
                      parseBulkMcqText(txt, setFolderQuestionsQueue, folderForm.subjectName || 'General Pharmacy');
                      document.getElementById('folder-mcq-text').value = '';
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    ⚡ Parse Questions
                  </button>
                  <button
                    type="button"
                    onClick={() => setFolderQuestionsQueue([])}
                    className="px-3 py-2 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Clear Queue
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer transition"
              >
                Save Item to Package Folder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PILLAR 2 - STUDY NOTES STUDIO WITH SUBJECT & CUSTOM EXAM BUILDER */}
      {activeTab === 'materials' && (
        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Upload Notes & PYQs (Course ➔ Semester ➔ Subject ➔ Notes/PYQs)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select Course ➔ Semester/Year/Exam ➔ Subject ➔ Material Type (Chapter Notes or PYQ Paper) ➔ Upload PDF
              </p>
            </div>

            <form onSubmit={handleCreateMaterial} className="space-y-4 text-xs sm:text-sm">
              {/* Step 1 & 2: Course & Semester/Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700">1. Course / Category</label>
                  <select
                    value={newMaterial.courseType}
                    onChange={e => {
                      const c = e.target.value;
                      let initialSem = 'Semester 1';
                      let initialSub = 'Human Anatomy and Physiology I';
                      if (c === 'D.Pharm') {
                        initialSem = '1st Year';
                        initialSub = 'Pharmaceutics';
                      } else if (c === 'QuickRevision') {
                        initialSem = 'All Subjects';
                        initialSub = QUICK_REVISION_SUBJECTS[0];
                      }
                      setNewMaterial({
                        ...newMaterial,
                        courseType: c,
                        semesterOrYear: initialSem,
                        subject: initialSub,
                        isCustomExam: false,
                        customExamName: '',
                      });
                    }}
                    className="w-full mt-1 p-2.5 border rounded-xl font-bold bg-slate-50"
                  >
                    <option value="B.Pharm">🎓 B.Pharm (8 Semesters)</option>
                    <option value="D.Pharm">💊 Diploma (1st & 2nd Year)</option>
                    <option value="QuickRevision">⚡ Quick Revision Notes (All Subjects)</option>
                  </select>
                </div>

                {/* Semester / Year Selector */}
                <div>
                  <label className="font-bold text-slate-700">
                    {newMaterial.courseType === 'B.Pharm'
                      ? '2. Semester'
                      : newMaterial.courseType === 'D.Pharm'
                      ? '2. Year'
                      : '2. Section'}
                  </label>

                  <select
                    value={newMaterial.semesterOrYear}
                    onChange={e => {
                      const sem = e.target.value;
                      const initialSub =
                        newMaterial.courseType === 'QuickRevision'
                          ? QUICK_REVISION_SUBJECTS[0]
                          : PCI_CURRICULUM[newMaterial.courseType]?.[sem]?.[0] || newMaterial.subject;
                      setNewMaterial({
                        ...newMaterial,
                        semesterOrYear: sem,
                        subject: initialSub,
                      });
                    }}
                    className="w-full mt-1 p-2.5 border rounded-xl font-bold bg-blue-50 text-blue-900"
                  >
                    {newMaterial.courseType === 'B.Pharm' &&
                      bPharmOptions.map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    {newMaterial.courseType === 'D.Pharm' &&
                      dPharmOptions.map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    {newMaterial.courseType === 'QuickRevision' && (
                      <option value="All Subjects">⚡ Pharmacist Exam Quick Revision</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">3. Material Type</label>
                  <select
                    value={newMaterial.materialType}
                    onChange={e => setNewMaterial({ ...newMaterial, materialType: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl font-bold"
                  >
                    <option value="chapter_notes">📄 Chapter / Revision Notes PDF</option>
                    {newMaterial.courseType !== 'QuickRevision' && (
                      <option value="pyq_paper">📑 University / Board PYQ Paper</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Step 3: Subject & Chapter/Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">4. Subject</label>
                  {standardSubjects.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        value={newMaterial.subject}
                        onChange={e => setNewMaterial({ ...newMaterial, subject: e.target.value })}
                        className="w-full mt-1 p-2.5 border rounded-xl font-bold"
                      >
                        {standardSubjects.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                        <option value="CUSTOM">➕ Other / Custom Subject Name...</option>
                      </select>

                      {newMaterial.subject === 'CUSTOM' && (
                        <input
                          type="text"
                          required
                          value={newMaterial.customSubject}
                          onChange={e => setNewMaterial({ ...newMaterial, customSubject: e.target.value })}
                          placeholder="Type custom subject name..."
                          className="w-full p-2.5 border rounded-xl font-bold bg-amber-50"
                        />
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      required
                      value={newMaterial.subject}
                      onChange={e => setNewMaterial({ ...newMaterial, subject: e.target.value })}
                      placeholder="e.g. Pharmacology, Pharmaceutics, Clinical Pharmacy"
                      className="w-full mt-1 p-2.5 border rounded-xl font-bold"
                    />
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700">
                    {newMaterial.materialType === 'chapter_notes' ? '5. Chapter Name / Number' : '5. Exam Year / Paper Details'}
                  </label>
                  <input
                    type="text"
                    value={newMaterial.chapter}
                    onChange={e => setNewMaterial({ ...newMaterial, chapter: e.target.value })}
                    placeholder={newMaterial.materialType === 'chapter_notes' ? 'e.g. Chapter 1: Dosage Forms & Posology' : 'e.g. 2024 End-Semester Solved Question Paper'}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Document Title</label>
                <input
                  type="text"
                  required
                  value={newMaterial.title}
                  onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  placeholder="e.g. Pharmaceutics-I Complete Handwritten Notes PDF"
                  className="w-full mt-1 p-2.5 border rounded-xl font-bold"
                />
              </div>

              {/* Upload PDF */}
              <div className="p-4 bg-slate-50 border rounded-2xl space-y-2">
                <label className="font-bold text-slate-700 block">PDF Document (Cloudinary Upload)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={e => handleFileUpload(e, url => setNewMaterial({ ...newMaterial, fileUrl: url }))}
                    className="text-xs"
                  />
                  {uploadingFile && <span className="text-xs text-blue-600 font-bold animate-pulse">Uploading to Cloudinary...</span>}
                </div>
                <input
                  type="text"
                  required
                  value={newMaterial.fileUrl}
                  onChange={e => setNewMaterial({ ...newMaterial, fileUrl: e.target.value })}
                  placeholder="Or paste direct PDF URL..."
                  className="w-full p-2 border rounded-xl text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition"
              >
                Upload Study Material PDF
              </button>
            </form>
          </div>

          {/* Uploaded Materials List Manager with Delete */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-900 text-base">
              Manage Uploaded Study Materials ({materialsList.length})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                  <tr>
                    <th className="p-3">Course</th>
                    <th className="p-3">Sem / Year / Exam</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Type</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {materialsList.map(m => (
                    <tr key={m._id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-blue-700">{m.courseType}</td>
                      <td className="p-3 font-semibold">{m.semesterOrYear}</td>
                      <td className="p-3">{m.subject}</td>
                      <td className="p-3 font-bold text-slate-900 max-w-xs truncate">{m.title}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {m.materialType === 'chapter_notes' ? 'Notes' : 'PYQ'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteMaterial(m._id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          title="Delete PDF"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PILLAR 3 - SINGLE MODEL PAPERS STUDIO */}
      {activeTab === 'singleModels' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 text-lg">
            Single Model Papers Creator (A-La-Carte)
          </h3>

          <form onSubmit={handleCreateSingleModel} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700">Exam Type</label>
                <input
                  type="text"
                  required
                  value={newSingleModel.examType}
                  onChange={e => setNewSingleModel({ ...newSingleModel, examType: e.target.value })}
                  placeholder="e.g. AIIMS, ESIC, GSSSB"
                  className="w-full mt-1 p-2.5 border rounded-xl uppercase font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">MRP Price (₹)</label>
                <input
                  type="number"
                  value={newSingleModel.price}
                  onChange={e => setNewSingleModel({ ...newSingleModel, price: e.target.value })}
                  className="w-full mt-1 p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Selling Price (₹)</label>
                <input
                  type="number"
                  value={newSingleModel.discountPrice}
                  onChange={e => setNewSingleModel({ ...newSingleModel, discountPrice: e.target.value })}
                  className="w-full mt-1 p-2.5 border rounded-xl font-bold text-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700">Model Paper Title</label>
              <input
                type="text"
                required
                value={newSingleModel.title}
                onChange={e => setNewSingleModel({ ...newSingleModel, title: e.target.value })}
                placeholder="e.g. AIIMS Pharmacist Grade-II Official Model Paper 2"
                className="w-full mt-1 p-2.5 border rounded-xl font-bold"
              />
            </div>

            <div className="flex items-center space-x-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <input
                type="checkbox"
                id="single-demo"
                checked={newSingleModel.isFree}
                onChange={e => setNewSingleModel({ ...newSingleModel, isFree: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="single-demo" className="text-xs font-bold text-emerald-900 cursor-pointer">
                🟢 Free Model Paper (No payment required)
              </label>
            </div>

            <div className="p-4 bg-slate-50 border rounded-2xl space-y-2">
              <label className="font-bold text-slate-700 block">PDF Answer Key / Question Paper</label>
              <input
                type="file"
                accept=".pdf"
                onChange={e => handleFileUpload(e, url => setNewSingleModel({ ...newSingleModel, pdfUrl: url }))}
                className="text-xs"
              />
              <input
                type="text"
                value={newSingleModel.pdfUrl}
                onChange={e => setNewSingleModel({ ...newSingleModel, pdfUrl: e.target.value })}
                placeholder="Paste PDF link..."
                className="w-full p-2 border rounded-xl text-xs font-mono"
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-900">⚡ CBT MCQs Queue ({singleModelQuestions.length} Questions)</span>
              </div>
              <textarea
                rows={4}
                id="single-mcq-text"
                placeholder="Paste Q1. A. B. C. D. Correct Answer: ... text copied from PDF..."
                className="w-full p-2.5 bg-white border rounded-xl text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  const txt = document.getElementById('single-mcq-text').value;
                  parseBulkMcqText(txt, setSingleModelQuestions, newSingleModel.examType || 'General Pharmacy');
                  document.getElementById('single-mcq-text').value = '';
                }}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow"
              >
                ⚡ Parse MCQs
              </button>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
            >
              Publish Model Paper
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: PILLAR 4 - NON-PHARMA HUB */}
      {activeTab === 'nonPharma' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 text-lg">
            Non-Pharma Aptitude & GK Studio
          </h3>

          <form onSubmit={handleCreateNonPharma} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700">Section</label>
                <select
                  value={newNonPharma.section}
                  onChange={e => setNewNonPharma({ ...newNonPharma, section: e.target.value })}
                  className="w-full mt-1 p-2.5 border rounded-xl font-bold"
                >
                  <option value="reasoning">🧠 Reasoning</option>
                  <option value="maths">📐 Quantitative Aptitude</option>
                  <option value="current_affairs">📰 Current Affairs</option>
                  <option value="general_studies_gk">🏛️ General Studies & GK</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700">Topic</label>
                <input
                  type="text"
                  value={newNonPharma.topic}
                  onChange={e => setNewNonPharma({ ...newNonPharma, topic: e.target.value })}
                  placeholder="e.g. Blood Relations or Time & Work"
                  className="w-full mt-1 p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Content Type</label>
                <select
                  value={newNonPharma.contentType}
                  onChange={e => setNewNonPharma({ ...newNonPharma, contentType: e.target.value })}
                  className="w-full mt-1 p-2.5 border rounded-xl font-bold"
                >
                  <option value="cbt">Interactive CBT Quiz</option>
                  <option value="pdf">Downloadable PDF Capsule</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700">Resource Title</label>
              <input
                type="text"
                required
                value={newNonPharma.title}
                onChange={e => setNewNonPharma({ ...newNonPharma, title: e.target.value })}
                placeholder="e.g. Blood Relations 50 High-Yield MCQs Practice"
                className="w-full mt-1 p-2.5 border rounded-xl font-bold"
              />
            </div>

            {newNonPharma.contentType === 'pdf' ? (
              <div className="p-4 bg-slate-50 border rounded-2xl space-y-2">
                <label className="font-bold text-slate-700 block">PDF Capsule</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={e => handleFileUpload(e, url => setNewNonPharma({ ...newNonPharma, pdfUrl: url }))}
                  className="text-xs"
                />
                <input
                  type="text"
                  value={newNonPharma.pdfUrl}
                  onChange={e => setNewNonPharma({ ...newNonPharma, pdfUrl: e.target.value })}
                  placeholder="Paste PDF link..."
                  className="w-full p-2 border rounded-xl text-xs font-mono"
                />
              </div>
            ) : (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-3">
                <span className="font-bold text-xs text-indigo-900">⚡ Parse Aptitude MCQs ({nonPharmaQuestions.length} Questions)</span>
                <textarea
                  rows={4}
                  id="nonpharma-mcq-text"
                  placeholder="Paste Q1. A. B. C. D. Correct Answer: ... text..."
                  className="w-full p-2.5 bg-white border rounded-xl text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    const txt = document.getElementById('nonpharma-mcq-text').value;
                    parseBulkMcqText(txt, setNonPharmaQuestions, newNonPharma.section || 'General Studies');
                    document.getElementById('nonpharma-mcq-text').value = '';
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  ⚡ Parse Questions
                </button>
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow"
            >
              Save Non-Pharma Resource
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: COUPONS & PROMO CODES (CREATE + DELETE) */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create Coupon Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Create Discount Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  placeholder="e.g. PHARMA20"
                  className="w-full mt-1 p-2.5 border rounded-xl uppercase font-bold tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Discount %</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={newCoupon.discountPercent}
                    onChange={e => setNewCoupon({ ...newCoupon, discountPercent: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.maxDiscount}
                    onChange={e => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Min Order (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.minOrderValue}
                    onChange={e => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Expiry (Days)</label>
                  <input
                    type="number"
                    value={newCoupon.expiryDays}
                    onChange={e => setNewCoupon({ ...newCoupon, expiryDays: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition"
              >
                + Add Coupon Code
              </button>
            </form>
          </div>

          {/* Active Coupons List with Delete */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Active Promo Codes ({coupons.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coupons.map(c => (
                <div
                  key={c._id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-extrabold text-indigo-700 text-base block">{c.code}</span>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">
                      {c.discountPercent}% OFF (Max ₹{c.maxDiscount})
                    </p>
                    <span className="text-[10px] text-slate-400">Min Order: ₹{c.minOrderValue || 0}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteCoupon(c._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Orders Log ({orders.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(o => (
                  <tr key={o._id}>
                    <td className="p-3 font-mono font-bold text-slate-800">{o.orderId}</td>
                    <td className="p-3 font-semibold">{o.userId?.name || 'Student'}</td>
                    <td className="p-3 font-bold text-emerald-600">₹{o.totalAmount}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {o.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: STUDENTS */}
      {activeTab === 'students' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Registered Students ({students.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map(st => (
              <div key={st._id} className="p-4 bg-slate-50 border rounded-2xl space-y-1">
                <span className="font-extrabold text-slate-900 text-sm block">{st.name}</span>
                <span className="text-xs text-slate-500 block">{st.email}</span>
                <span className="text-xs text-slate-400 block">{st.mobile}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: STUDENT INQUIRIES & DOUBTS */}
      {activeTab === 'contacts' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Student Inquiries & Doubts ({contactsList.length})
              </h3>
              <p className="text-xs text-slate-500">
                Messages and doubt submissions sent from the "Contact Admin" section on the Home page and /contact page.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAdminData}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl transition self-start sm:self-auto cursor-pointer"
              >
                🔄 Refresh Inquiries
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setContactFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                contactFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({contactsList.length})
            </button>
            <button
              onClick={() => setContactFilter('pending')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                contactFilter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              🟡 Pending ({contactsList.filter(c => !c.isResolved).length})
            </button>
            <button
              onClick={() => setContactFilter('resolved')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                contactFilter === 'resolved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              🟢 Resolved ({contactsList.filter(c => c.isResolved).length})
            </button>
          </div>

          {contactsList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <span className="text-3xl">📭</span>
              <p className="text-sm font-semibold">No student inquiries received yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactsList
                .filter(c => {
                  if (contactFilter === 'pending') return !c.isResolved;
                  if (contactFilter === 'resolved') return c.isResolved;
                  return true;
                })
                .map(c => (
                  <div
                    key={c._id}
                    className={`p-5 rounded-2xl border transition space-y-3 ${
                      c.isResolved
                        ? 'bg-slate-50/70 border-slate-200 opacity-90'
                        : 'bg-white border-amber-200/80 shadow-sm hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{c.name}</span>
                          {c.isResolved ? (
                            <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              ✓ Resolved
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Pending Action
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1">
                          {c.subject || 'General Inquiry'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-slate-100 rounded-xl text-xs text-slate-700 leading-relaxed shadow-inner">
                      <p className="whitespace-pre-wrap font-medium">{c.message}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center gap-3 text-slate-600">
                        <a
                          href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject || 'Inquiry')}`}
                          className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          ✉️ {c.email}
                        </a>
                        {c.mobile && (
                          <a
                            href={`tel:${c.mobile}`}
                            className="font-medium text-slate-500 hover:text-slate-900"
                          >
                            📞 {c.mobile}
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleResolve(c._id)}
                          className={`px-2.5 py-1 font-bold text-xs rounded-lg transition cursor-pointer ${
                            c.isResolved
                              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          }`}
                          title={c.isResolved ? 'Mark as Unresolved / Pending' : 'Mark as Resolved'}
                        >
                          {c.isResolved ? '↺ Reopen' : '✓ Mark Resolved'}
                        </button>

                        <a
                          href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject || 'Inquiry - PharmaCode07')}&body=Dear ${encodeURIComponent(c.name)},\n\nThank you for reaching out to PharmaCode07 regarding "${encodeURIComponent(c.subject || 'your inquiry')}".\n\n`}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
                        >
                          Reply ↗
                        </a>

                        <button
                          onClick={() => handleDeleteContact(c._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
