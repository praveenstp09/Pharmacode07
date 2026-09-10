import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileCheck,
  Award,
  Clock,
  Download,
  BookOpen,
  CheckCircle2,
  Play,
  Zap,
  Eye,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CardSkeleton, { TableSkeleton } from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import TestSeriesCard from '../components/common/cards/TestSeriesCard';
import StudyPackCard from '../components/common/cards/StudyPackCard';
import SingleModelCard from '../components/common/cards/SingleModelCard';
import NonPharmaCard from '../components/common/cards/NonPharmaCard';
import confetti from 'canvas-confetti';
import { downloadPdfToLocal } from '../utils/downloadHelper';

const Dashboard = () => {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [showSuccessAlert, setShowSuccessAlert] = useState(
    searchParams.get('status') === 'success'
  );

  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('tests'); // 'tests', 'attempts', 'materials', 'models'
  const [purchasedSeries, setPurchasedSeries] = useState([]);
  const [purchasedModels, setPurchasedModels] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [purchasedPacks, setPurchasedPacks] = useState([]);
  const [nonPharma, setNonPharma] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showSuccessAlert) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#10B981', '#6366F1', '#F59E0B'],
        });
      } catch (e) {
        console.error('Confetti trigger', e);
      }
    }
  }, [showSuccessAlert]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const freshUser = await refreshUser();
      const currentUser = freshUser || user;
      const userTests = currentUser?.purchasedTests || [];
      const userMaterials = currentUser?.purchasedMaterials || [];
      const userSingleModels = currentUser?.purchasedSingleModels || [];
      const userNonPharma = currentUser?.purchasedNonPharma || [];

      // 1. Fetch user mock test attempts
      const attemptsRes = await api.get('/attempts/my-attempts');
      if (attemptsRes.data.success) {
        setAttempts(attemptsRes.data.data);
      }

      // 2. Fetch test series owned by the student
      const seriesRes = await api.get('/test-series');
      if (seriesRes.data.success) {
        const owned = seriesRes.data.data.filter(s =>
          userTests.some(t => (t?._id || t)?.toString() === s._id?.toString())
        );
        setPurchasedSeries(owned);
      }

      // 3. Fetch single model papers owned by the student
      const modelRes = await api.get('/single-models');
      if (modelRes.data.success) {
        const ownedModels = modelRes.data.data.filter(m =>
          userSingleModels.some(p => (p?._id || p)?.toString() === m._id?.toString())
        );
        setPurchasedModels(ownedModels);
      }

      // 4. Fetch study notes owned by the student
      const matRes = await api.get('/materials');
      if (matRes.data.success) {
        const ownedMat = matRes.data.data.filter(m =>
          userMaterials.some(p => (p?._id || p)?.toString() === m._id?.toString())
        );
        setMaterials(ownedMat);
      }

      // 4b. Fetch study material packages owned by the student
      try {
        const userPacks = currentUser?.purchasedStudyPacks || [];
        const packRes = await api.get('/study-packs');
        if (packRes.data.success) {
          const ownedPacks = (packRes.data.data || []).filter(p =>
            userPacks.some(id => (id?._id || id)?.toString() === p._id?.toString())
          );
          setPurchasedPacks(ownedPacks);
        }
      } catch (packErr) {
        console.error('Failed to load study packs for dashboard', packErr);
      }

      // 5. Fetch non-pharma packages owned by the student
      const nonPharmaRes = await api.get('/non-pharma');
      if (nonPharmaRes.data.success) {
        const ownedNP = nonPharmaRes.data.data.filter(np =>
          userNonPharma.some(p => (p?._id || p)?.toString() === np._id?.toString())
        );
        setNonPharma(ownedNP);
      }
    } catch (err) {
      console.error('Error fetching dashboard data', err);
      showToast('Unable to load some dashboard packages. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Performance calculations
  const totalAttemptsCount = attempts.length;
  const avgScore =
    totalAttemptsCount > 0
      ? Math.round(
          attempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / totalAttemptsCount
        )
      : 0;

  const totalOtherModelsCount = purchasedModels.length + nonPharma.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Payment Success Alert */}
      {showSuccessAlert && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base">Order Completed Successfully!</h4>
              <p className="text-xs text-emerald-700">
                Your purchased package is now fully unlocked. Start practicing below!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowSuccessAlert(false);
              window.history.replaceState({}, '', '/dashboard');
            }}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 rounded-xl cursor-pointer transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Profile Section */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span>Student Learning Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Pharmacist'}! 👋
          </h1>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-xs text-blue-200 font-medium">{user?.email}</span>
            {user?.isEmailVerified && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Account</span>
              </span>
            )}
          </div>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
            Track your mock test attempts, review solutions with rationales, and access your unlocked study materials.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/test-series"
            className="px-5 py-3 bg-white text-blue-900 hover:bg-blue-50 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition"
          >
            Explore More Tests →
          </Link>
        </div>
      </div>

      {/* Stats Cards (Strictly Purchased & Attempted counts) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 1. Enrolled Test Series */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Enrolled Tests</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {purchasedSeries.length}
            </span>
          </div>
        </div>

        {/* 2. Tests Taken */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Tests Taken</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {totalAttemptsCount}
            </span>
          </div>
        </div>

        {/* 3. Avg. Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Avg. Accuracy</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {avgScore}%
            </span>
          </div>
        </div>

        {/* 4. Purchased Study Notes (Only Actual Purchased Study Notes) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Study Notes</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {materials.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'tests'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>My Test Series ({purchasedSeries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attempts')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'attempts'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Attempt History ({attempts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'materials'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>My Study Notes ({materials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'models'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Single Models & Packs ({totalOtherModelsCount})</span>
        </button>
      </div>

      {/* Tab 1: My Purchased Test Series */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : purchasedSeries.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                You haven't enrolled in any Test Series yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Unlock GSSSB Junior Pharmacist 120 MCQ Model Papers or UPSSSC Special Test Series to start practicing with real exam timers.
              </p>
              <Link
                to="/test-series"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow transition"
              >
                Browse Test Series Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedSeries.map(item => (
                <TestSeriesCard
                  key={item._id}
                  item={item}
                  isPurchased={true}
                  variant="dashboard"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Test Attempt History */}
      {activeTab === 'attempts' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <TableSkeleton rows={5} />
          ) : attempts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Clock className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No test attempts recorded yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Take a mock test from your enrolled packages or practice free daily quizzes to see your scores here.
              </p>
              <Link
                to="/test-series"
                className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Browse Available Mock Tests
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Exam Paper & Series</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-4">Percentage</th>
                    <th className="py-3.5 px-4">Breakdown</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attempts.map(att => (
                    <tr key={att._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="font-extrabold text-slate-900 text-sm">
                            {att.paperTitle || att.testPaperId?.title || 'Mock Test Paper'}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                            {att.parentTitle && (
                              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                                {att.parentTitle}
                              </span>
                            )}
                            {att.categoryBadge && (
                              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {att.categoryBadge}
                              </span>
                            )}
                            {att.subBadge && (
                              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {att.subBadge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(att.completedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                        {att.score} / {att.totalMarks}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-xs ${
                            att.percentage >= 60
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                        <span className="text-emerald-600 font-bold">{att.correctCount}✓</span> |{' '}
                        <span className="text-rose-600 font-bold">{att.incorrectCount}✗</span> |{' '}
                        <span className="text-slate-400">{att.unattemptedCount}-</span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/result/${att._id}`}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-xs rounded-lg transition inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5 inline" />
                          <span>View Solution</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: My Purchased Study Notes */}
      {activeTab === 'materials' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : materials.length === 0 && purchasedPacks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Study Notes Enrolled Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Explore comprehensive B.Pharm semester notes, D.Pharm year guides, and quick revision pharmacist PDFs.
              </p>
              <Link
                to="/study-materials"
                className="inline-block px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow hover:bg-blue-700 transition"
              >
                Browse Study Notes
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Study Material Packages */}
              {purchasedPacks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Enrolled Study Material Packages ({purchasedPacks.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {purchasedPacks.map((pack) => (
                      <StudyPackCard
                        key={pack._id}
                        pack={pack}
                        isPurchased={true}
                        variant="dashboard"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy Single PDFs if any */}
              {materials.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Individual Purchased Notes ({materials.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map(mat => (
                <div
                  key={mat._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {mat.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{mat.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{mat.description}</p>
                  </div>

                  {mat.fileUrl ? (
                    <button
                      onClick={() => {
                        const safeName = (mat.title || 'Pharmacode_Study_Note').replace(/[^a-zA-Z0-9_-]/g, '_');
                        downloadPdfToLocal(mat.fileUrl, `${safeName}.pdf`);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5 flex-shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold">Available</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
)}

      {/* Tab 4: Single Model Papers & Custom Packs */}
      {activeTab === 'models' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : totalOtherModelsCount === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-3">
              <Zap className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No Single Model Papers Enrolled</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore individual 100 MCQ pharmacist model papers and specialized test packages.
              </p>
              <Link
                to="/single-model-papers"
                className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow hover:bg-blue-700 transition"
              >
                Browse Model Papers
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {purchasedModels.map(model => (
                <SingleModelCard
                  key={model._id}
                  paper={model}
                  isPurchased={true}
                  variant="dashboard"
                />
              ))}

              {nonPharma.map(item => (
                <NonPharmaCard
                  key={item._id}
                  item={item}
                  variant="dashboard"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
