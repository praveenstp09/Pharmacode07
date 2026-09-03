import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Modular Admin Tab Components
import AdminStatsTab from '../components/admin/AdminStatsTab';
import AdminTestSeriesTab from '../components/admin/AdminTestSeriesTab';
import AdminMaterialsTab from '../components/admin/AdminMaterialsTab';
import AdminSingleModelsTab from '../components/admin/AdminSingleModelsTab';
import AdminNonPharmaTab from '../components/admin/AdminNonPharmaTab';
import AdminCouponsTab from '../components/admin/AdminCouponsTab';
import AdminOrdersTab from '../components/admin/AdminOrdersTab';
import AdminStudentsTab from '../components/admin/AdminStudentsTab';
import AdminContactsTab from '../components/admin/AdminContactsTab';
import AdminEditModal from '../components/admin/AdminEditModal';

const AdminDashboard = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [seriesList, setSeriesList] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [singleModelsList, setSingleModelsList] = useState([]);
  const [nonPharmaList, setNonPharmaList] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [students, setStudents] = useState([]);
  const [contactsList, setContactsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // File Upload State
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadContext, setUploadContext] = useState(null); // 'create' | 'modal'

  // Universal Edit Popup Modal State
  const [editModal, setEditModal] = useState({
    open: false,
    type: '', // 'series', 'material', 'singleModel', 'nonPharma'
    data: null,
  });

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

  // Shared file upload handler with live progress tracking and context scoping
  const handleFileUpload = async (e, setTargetUrl, context = 'create') => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'pharmacode_docs');

    setUploadingFile(true);
    setUploadProgress(0);
    setUploadContext(context);
    try {
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });
      if (res.data.success) {
        const url = res.data.data.url;
        setTargetUrl(url);
        setUploadProgress(100);
        showToast('File uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast('Upload failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
      setUploadContext(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'stats', label: '📊 Stats' },
    { id: 'series', label: '📁 Pillar 1: Test Series' },
    { id: 'materials', label: '🎓 Pillar 2: Study Notes Studio' },
    { id: 'singleModels', label: '🎯 Pillar 3: Model Papers' },
    { id: 'nonPharma', label: '🧠 Pillar 4: Non-Pharma' },
    { id: 'coupons', label: '🏷️ Coupons & Promos' },
    { id: 'orders', label: '💳 Orders' },
    { id: 'students', label: '👥 Students' },
    { id: 'contacts', label: `💬 Student Inquiries (${contactsList.length})` },
  ];

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
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'stats' && (
        <AdminStatsTab stats={stats} setActiveTab={setActiveTab} />
      )}

      {activeTab === 'series' && (
        <AdminTestSeriesTab
          seriesList={seriesList}
          fetchAdminData={fetchAdminData}
          setEditModal={setEditModal}
          showToast={showToast}
          handleFileUpload={handleFileUpload}
          uploadingFile={uploadingFile}
          uploadProgress={uploadProgress}
          uploadContext={uploadContext}
        />
      )}

      {activeTab === 'materials' && (
        <AdminMaterialsTab
          materialsList={materialsList}
          fetchAdminData={fetchAdminData}
          setEditModal={setEditModal}
          showToast={showToast}
          handleFileUpload={handleFileUpload}
          uploadingFile={uploadingFile}
          uploadProgress={uploadProgress}
          uploadContext={uploadContext}
        />
      )}

      {activeTab === 'singleModels' && (
        <AdminSingleModelsTab
          singleModelsList={singleModelsList}
          fetchAdminData={fetchAdminData}
          setEditModal={setEditModal}
          showToast={showToast}
          handleFileUpload={handleFileUpload}
          uploadingFile={uploadingFile}
          uploadProgress={uploadProgress}
          uploadContext={uploadContext}
        />
      )}

      {activeTab === 'nonPharma' && (
        <AdminNonPharmaTab
          nonPharmaList={nonPharmaList}
          fetchAdminData={fetchAdminData}
          setEditModal={setEditModal}
          showToast={showToast}
          handleFileUpload={handleFileUpload}
          uploadingFile={uploadingFile}
          uploadProgress={uploadProgress}
          uploadContext={uploadContext}
        />
      )}

      {activeTab === 'coupons' && (
        <AdminCouponsTab
          coupons={coupons}
          fetchAdminData={fetchAdminData}
          showToast={showToast}
        />
      )}

      {activeTab === 'orders' && (
        <AdminOrdersTab orders={orders} />
      )}

      {activeTab === 'students' && (
        <AdminStudentsTab students={students} />
      )}

      {activeTab === 'contacts' && (
        <AdminContactsTab
          contactsList={contactsList}
          setContactsList={setContactsList}
          fetchAdminData={fetchAdminData}
          showToast={showToast}
        />
      )}

      {/* Universal Admin Edit Popup Modal */}
      <AdminEditModal
        editModal={editModal}
        setEditModal={setEditModal}
        fetchAdminData={fetchAdminData}
        showToast={showToast}
        handleFileUpload={handleFileUpload}
        uploadingFile={uploadingFile}
        uploadProgress={uploadProgress}
        uploadContext={uploadContext}
      />
    </div>
  );
};

export default AdminDashboard;
