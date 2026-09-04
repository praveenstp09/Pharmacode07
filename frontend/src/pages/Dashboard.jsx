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
  Layers,
  Eye,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CardSkeleton, { TableSkeleton } from '../components/common/SkeletonCard';
import confetti from 'canvas-confetti';
import { downloadPdfToLocal } from '../utils/downloadHelper';

const Dashboard = () => {
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
                <div
                  key={item._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-blue-300 transition"
                >
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent" />
                    <div className="absolute bottom-3 left-3 text-white text-xs font-semibold">
                      {item.totalTests} Tests {item.totalQuestions > 0 ? `• ${item.totalQuestions} Questions` : (item.totalPdfs ? `• ${item.totalPdfs} PDFs` : '')}
                    </div>
                  </div>

                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                    </div>

                    <Link
                      to={`/test-series/${item.slug}`}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start / Resume Mock Tests</span>
                    </Link>
                  </div>
                </div>
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
          ) : materials.length === 0 ? (
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
                <div
                  key={model._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:border-blue-300 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-extrabold rounded-md uppercase">
                        {model.examType || 'Pharmacist'}
                      </span>
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        ✓ Enrolled
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {model.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{model.description}</p>

                    <div className="flex items-center space-x-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <span>⏱️ {model.durationMinutes || 100} Mins</span>
                      <span>📝 {model.totalQuestions || 100} MCQs</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    {model.testPaperId && (
                      <Link
                        to={`/attempt/${model.testPaperId._id || model.testPaperId}`}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Start CBT Test</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}

              {nonPharma.map(item => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700">
                        {item.section}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        ✓ Enrolled
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base leading-snug">{item.title}</h4>
                    {item.topic && (
                      <p className="text-xs text-slate-500 font-medium">Topic: {item.topic}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    {item.contentType === 'cbt' && item.testPaperId ? (
                      <Link
                        to={`/attempt/${item.testPaperId._id || item.testPaperId}`}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start CBT Drill</span>
                      </Link>
                    ) : item.pdfUrl ? (
                      <button
                        onClick={() => {
                          const safeName = (item.title || 'Pharmacode_Aptitude').replace(/[^a-zA-Z0-9_-]/g, '_');
                          downloadPdfToLocal(item.pdfUrl, `${safeName}.pdf`);
                        }}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF Notes</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold block text-center">
                        Resource Ready
                      </span>
                    )}
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

export default Dashboard;
