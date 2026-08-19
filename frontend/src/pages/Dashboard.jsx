import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck,
  Award,
  Clock,
  RotateCcw,
  Download,
  BookOpen,
  TrendingUp,
  Bell,
  CheckCircle2,
  Play,
  ArrowRight,
  User,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const purchaseSuccess = searchParams.get('status') === 'success';

  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('tests'); // 'tests', 'attempts', 'materials'
  const [purchasedSeries, setPurchasedSeries] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await refreshUser();

      // 1. Fetch user attempts
      const attemptsRes = await api.get('/attempts/my-attempts');
      if (attemptsRes.data.success) {
        setAttempts(attemptsRes.data.data);
      }

      // 2. Fetch all test series to match user's purchased ones
      const seriesRes = await api.get('/test-series');
      if (seriesRes.data.success) {
        // Filter those user owns
        const owned = seriesRes.data.data.filter(s =>
          user?.purchasedTests?.some(t => (t._id || t) === s._id)
        );
        setPurchasedSeries(owned);
      }

      // 3. Fetch materials
      const matRes = await api.get('/materials');
      if (matRes.data.success) {
        const ownedMat = matRes.data.data.filter(
          m => !m.isPaid || user?.purchasedMaterials?.some(p => (p._id || p) === m._id)
        );
        setMaterials(ownedMat);
      }

      // 4. Fetch announcements
      const notifRes = await api.get('/admin/notifications').catch(() => ({ data: { data: [] } }));
      if (notifRes.data?.data) {
        setNotifications(notifRes.data.data);
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
  const bestScore =
    totalAttemptsCount > 0
      ? Math.max(...attempts.map(a => a.percentage || 0))
      : 0;

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Purchase Success Toast */}
      {purchaseSuccess && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm">Payment Successful & Test Unlocked!</div>
              <div className="text-xs text-emerald-100">
                Your model papers are now active. Click "Start Test" below to begin practicing.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Registered Mobile: <strong>+91 {user?.mobile}</strong> | Email: <strong>{user?.email}</strong>
          </p>
        </div>

        <Link
          to="/test-series"
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-lg text-sm transition text-center whitespace-nowrap self-start md:self-auto"
        >
          + Unlock More Model Papers
        </Link>
      </div>

      {/* Performance Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Unlocked Series</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {purchasedSeries.length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Tests Attempted</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {totalAttemptsCount}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>Average Accuracy</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">
            {avgScore}%
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Highest Score</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            {bestScore}%
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 ${
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
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 ${
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
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 ${
            activeTab === 'materials'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>My Study Notes ({materials.length})</span>
        </button>
      </div>

      {/* Tab 1: My Purchased Test Series */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          {purchasedSeries.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                You haven't unlocked any Test Series yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Unlock GSSSB Junior Pharmacist 120 MCQ Model Papers or UPSSSC Special Test Series to start practicing with real exam timers.
              </p>
              <Link
                to="/test-series"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow transition"
              >
                Browse Model Papers
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
                    <div className="absolute top-3 left-3 bg-blue-600 text-white font-extrabold text-xs px-2.5 py-0.5 rounded uppercase">
                      {item.examType}
                    </div>
                    <div className="absolute bottom-3 left-3 text-white text-xs font-semibold">
                      {item.totalTests} Full Tests • {item.totalQuestions} Questions
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
          {attempts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-sm">No test attempts recorded yet.</p>
              <p className="text-xs">Take your first mock test to see your score analysis here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Exam Paper</th>
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
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {att.testPaperId?.title || 'Mock Test Paper'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(att.completedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {att.score} / {att.totalMarks}
                      </td>
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <span className="text-emerald-600 font-bold">{att.correctCount}✓</span> |{' '}
                        <span className="text-rose-600 font-bold">{att.incorrectCount}✗</span> |{' '}
                        <span className="text-slate-400">{att.unattemptedCount}-</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/result/${att._id}`}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-xs rounded-lg transition"
                        >
                          View Solution
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

      {/* Tab 3: Study Notes & PDFs */}
      {activeTab === 'materials' && (
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

              <a
                href={mat.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5 flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
