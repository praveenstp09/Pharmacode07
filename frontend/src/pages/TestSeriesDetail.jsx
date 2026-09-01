import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileCheck,
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  Lock,
  Play,
  ShoppingCart,
  Zap,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  FileText,
  Download,
  Eye,
  Layers,
  Sparkles,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import PdfViewerModal from '../components/common/PdfViewerModal';
import { downloadPdfToLocal } from '../utils/downloadHelper';

const TestSeriesDetail = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFolderTab, setActiveFolderTab] = useState('cbtMixed'); // 'cbtMixed', 'pyqs', 'mcqPdfs', 'subjectWise'
  const [activeSubject, setActiveSubject] = useState('');

  // PDF Previewer Modal State
  const [previewPdf, setPreviewPdf] = useState({ isOpen: false, url: '', title: '' });

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    const res = addToCart(series);
    if (res?.added) {
      showToast(`${series.title} added to cart!`, 'success');
    } else {
      showToast(res?.message || 'Item is already in cart', 'info');
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/test-series/${slug}`);
        if (res.data.success) {
          setData(res.data.data);
          const subjects = Object.keys(res.data.data.folders?.subjectWise || {});
          if (subjects.length > 0) setActiveSubject(subjects[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load test series');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug, user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-semibold">Loading test series folders...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Test Series Not Found</h2>
        <p className="text-slate-500 text-sm">{error || 'The requested package does not exist.'}</p>
        <Link to="/test-series" className="inline-block px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const { series, isUnlocked, folders, stats, legacyPapers } = data;

  const handleBuyNow = () => {
    addToCart(series);
    navigate('/checkout');
  };

  const cbtMixedList = folders?.cbtMixed || [];
  const pyqsList = folders?.pyqs || [];
  const subjectWiseMap = folders?.subjectWise || {};
  const subjectKeys = Object.keys(subjectWiseMap);

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/test-series" className="hover:text-blue-600">Test Series</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-bold truncate">{series.title}</span>
      </div>

      {/* Hero Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-600 text-white font-extrabold text-xs px-3 py-1 rounded-md uppercase tracking-wider">
                {series.examType} Official Pack
              </span>
              <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-xs px-2.5 py-1 rounded-md">
                365 Days Full Validity
              </span>
              {isUnlocked && (
                <span className="bg-emerald-500 text-white font-extrabold text-xs px-3 py-1 rounded-md flex items-center space-x-1 shadow">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Full Package Active</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              {series.title}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              {series.description}
            </p>

            {/* Folder Summary Pills - 3 Sub-Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                <span className="text-slate-400 text-[11px] block font-semibold">📁 Folder 1</span>
                <span className="font-bold text-sm sm:text-base text-white">{cbtMixedList.length || series.totalTests || 0} Model Papers</span>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                <span className="text-slate-400 text-[11px] block font-semibold">📁 Folder 2</span>
                <span className="font-bold text-sm sm:text-base text-white">{pyqsList.length} Previous Year Papers</span>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                <span className="text-slate-400 text-[11px] block font-semibold">📁 Folder 3</span>
                <span className="font-bold text-sm sm:text-base text-white">{subjectKeys.length} Subject-Wise Tests</span>
              </div>
            </div>
          </div>

          {/* Pricing & CTA Box */}
          <div className="lg:col-span-4 bg-white text-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-baseline space-x-2">
              {series.isFree ? (
                <span className="text-3xl font-extrabold text-emerald-600">FREE</span>
              ) : (
                <>
                  <span className="text-3xl font-extrabold text-slate-900">
                    ₹{series.discountPrice}
                  </span>
                  {series.price > series.discountPrice && (
                    <span className="text-slate-400 line-through text-sm font-semibold">
                      ₹{series.price}
                    </span>
                  )}
                  {series.price > series.discountPrice && (
                    <span className="text-emerald-600 font-extrabold text-xs bg-emerald-50 px-2 py-0.5 rounded">
                      {Math.round(((series.price - series.discountPrice) / series.price) * 100)}% OFF
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="text-xs text-slate-600 space-y-1.5 py-1">
              {series.highlights && series.highlights.length > 0 ? (
                series.highlights.map((h, i) => (
                  <p key={i} className="flex items-start space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{h}</span>
                  </p>
                ))
              ) : (
                <>
                  <p className="flex items-center space-x-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>🟢 1 Free Demo Unlocked in Every Folder</span>
                  </p>
                  <p className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Includes all 3 sub-folders with 365-day access</span>
                  </p>
                </>
              )}
            </div>

            {isUnlocked ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="font-bold text-emerald-800 text-xs sm:text-sm flex items-center justify-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>You Have Full Access to This Package!</span>
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center space-x-2 transition transform hover:-translate-y-0.5"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Unlock Full Package (₹{series.discountPrice})</span>
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3-FOLDER INTERACTIVE EXPLORER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
              <Layers className="w-6 h-6 text-blue-600" />
              <span>Package Content Folders</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore CBT mock tests, PYQ exams, and subject-wise CBT drills. Free demo items are unlocked!
            </p>
          </div>
        </div>

        {/* 3 Folder Navigation Tabs - Sticky */}
        <div className="sticky top-16 md:top-20 z-20 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80 shadow-md">
          <button
            onClick={() => setActiveFolderTab('cbtMixed')}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center space-x-2 ${
              activeFolderTab === 'cbtMixed'
                ? 'bg-white text-blue-600 shadow-md font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📝 1. Model Papers</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-700">
              {cbtMixedList.length || (legacyPapers ? legacyPapers.length : 0)}
            </span>
          </button>

          <button
            onClick={() => setActiveFolderTab('pyqs')}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center space-x-2 ${
              activeFolderTab === 'pyqs'
                ? 'bg-white text-blue-600 shadow-md font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📄 2. Previous Year Papers</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 text-indigo-700">
              {pyqsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFolderTab('subjectWise')}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center space-x-2 ${
              activeFolderTab === 'subjectWise'
                ? 'bg-white text-blue-600 shadow-md font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📚 3. Subject-Wise Tests</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700">
              {subjectKeys.length}
            </span>
          </button>
        </div>

        {/* FOLDER 1: CBT MIXED TESTS */}
        {activeFolderTab === 'cbtMixed' && (
          <div className="space-y-3">
            {cbtMixedList.length > 0 ? (
              cbtMixedList.map((item, idx) => {
                const isItemOpen = isUnlocked || item.isFreeDemo;
                return (
                  <div
                    key={item._id || idx}
                    className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isItemOpen
                        ? 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                        : 'bg-slate-50/60 border-slate-200 opacity-90'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${
                          isItemOpen ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {item.title}
                          </h3>
                          {item.isFreeDemo && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase">
                              Free Demo
                            </span>
                          )}
                          {item.isAttempted && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded-full flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-blue-600 inline" />
                              <span>Attempted{item.latestAttempt?.score !== undefined ? ` (${item.latestAttempt.score}/${item.latestAttempt.totalMarks})` : ''}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{item.durationMinutes || 120} Mins</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>{item.totalQuestions || 100} MCQs</span>
                          </span>
                          {Number(item.negativeMarks ?? (item.paperDetails?.negativeMarks ?? 0.25)) === 0 ? (
                            <span className="text-emerald-700 font-semibold">No Negative Marking</span>
                          ) : (
                            <span>Negative Marking (-{item.negativeMarks ?? (item.paperDetails?.negativeMarks ?? 0.25)})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                      {isItemOpen ? (
                        item.isAttempted ? (
                          <>
                            {item.latestAttempt?.attemptId && (
                              <Link
                                to={`/result/${item.latestAttempt.attemptId}`}
                                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>View Result</span>
                              </Link>
                            )}
                            <Link
                              to={`/attempt/${item.testPaperId || item._id}`}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Retake Test</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            to={`/attempt/${item.testPaperId || item._id}`}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition flex items-center space-x-2"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            <span>Start CBT Test</span>
                          </Link>
                        )
                      ) : (
                        <button
                          onClick={handleBuyNow}
                          className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock Full Pack</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : legacyPapers && legacyPapers.length > 0 ? (
              legacyPapers.map((paper, idx) => {
                const isPaperOpen = isUnlocked || paper.isFreeDemo;
                return (
                  <div
                    key={paper._id}
                    className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isPaperOpen
                        ? 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                        : 'bg-slate-50 border-slate-200 opacity-90'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${
                          isPaperOpen ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {paper.paperNumber || idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {paper.title}
                          </h3>
                          {paper.isFreeDemo && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase">
                              Free Demo
                            </span>
                          )}
                          {paper.isAttempted && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded-full flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-blue-600 inline" />
                              <span>Attempted{paper.latestAttempt?.score !== undefined ? ` (${paper.latestAttempt.score}/${paper.latestAttempt.totalMarks})` : ''}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>⏱️ {paper.durationMinutes || 120} Mins</span>
                          <span>📝 {paper.questionsCount || 100} MCQs</span>
                          {Number(paper.negativeMarks ?? 0.25) === 0 ? (
                            <span className="text-emerald-700 font-semibold">No Negative Marking</span>
                          ) : (
                            <span>Negative Marking (-{paper.negativeMarks ?? 0.25})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                      {isPaperOpen ? (
                        paper.isAttempted ? (
                          <>
                            {paper.latestAttempt?.attemptId && (
                              <Link
                                to={`/result/${paper.latestAttempt.attemptId}`}
                                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>View Result</span>
                              </Link>
                            )}
                            <Link
                              to={`/attempt/${paper._id}`}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Retake Test</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            to={`/attempt/${paper._id}`}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition flex items-center space-x-2"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            <span>Start CBT Test</span>
                          </Link>
                        )
                      ) : (
                        <button
                          onClick={handleBuyNow}
                          className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock Full Pack</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-sm text-slate-500 py-8">No model papers in this folder yet.</p>
            )}
          </div>
        )}

        {/* FOLDER 2: PYQs (CBT SIMULATOR + SOLVED PDF) */}
        {activeFolderTab === 'pyqs' && (
          <div className="space-y-3">
            {pyqsList.length > 0 ? (
              pyqsList.map((item, idx) => {
                const isItemOpen = isUnlocked || item.isFreeDemo;
                const hasCbt = Boolean(item.testPaperId || item.contentType === 'cbt');
                const hasPdf = Boolean(item.pdfUrl);

                return (
                  <div
                    key={item._id || idx}
                    className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {item.title}
                          </h3>
                          {item.isFreeDemo && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase">
                              Free Demo
                            </span>
                          )}
                          {item.isAttempted && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded-full flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-blue-600 inline" />
                              <span>Attempted{item.latestAttempt?.score !== undefined ? ` (${item.latestAttempt.score}/${item.latestAttempt.totalMarks})` : ''}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Official Solved Exam Paper with Step-by-Step Answer Key & Explanations ({item.year || 2023})
                        </p>
                        <div className="flex items-center space-x-3 text-[11px] text-indigo-700 font-semibold mt-1">
                          <span>✨ Online CBT Mode Available</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                      {isItemOpen ? (
                        <>
                          {/* CBT Exam Simulator Button */}
                          {hasCbt && (
                            item.isAttempted ? (
                              <Link
                                to={`/attempt/${item.testPaperId || item._id}`}
                                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition shadow"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Retake Exam</span>
                              </Link>
                            ) : (
                              <Link
                                to={`/attempt/${item.testPaperId || item._id}`}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition shadow"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>Take CBT Exam</span>
                              </Link>
                            )
                          )}

                          {/* PDF Preview & Download Buttons */}
                          {hasPdf ? (
                            <>
                              <button
                                onClick={() =>
                                  setPreviewPdf({
                                    isOpen: true,
                                    url: item.pdfUrl,
                                    title: item.title,
                                  })
                                }
                                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview PDF</span>
                              </button>
                              <button
                                onClick={() => downloadPdfToLocal(item.pdfUrl, `${item.title || 'PYQ_Paper'}.pdf`)}
                                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition shadow cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download PDF</span>
                              </button>
                            </>
                          ) : (
                            !hasCbt && (
                              <span className="text-xs text-slate-400 font-medium">Coming soon</span>
                            )
                          )}
                        </>
                      ) : (
                        <button
                          onClick={handleBuyNow}
                          className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock Full Pack</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-sm text-slate-500 py-8">No previous year papers uploaded in this folder yet.</p>
            )}
          </div>
        )}

        {/* FOLDER 3: SUBJECT-WISE TESTS (CBT ONLY) */}
        {activeFolderTab === 'subjectWise' && (
          <div className="space-y-6">
            {subjectKeys.length > 0 ? (
              <div className="space-y-4">
                {/* Subject Selector Pills */}
                <div className="flex flex-wrap gap-2">
                  {subjectKeys.map(sub => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubject(sub)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                        activeSubject === sub
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {sub} ({subjectWiseMap[sub]?.length || 0})
                    </button>
                  ))}
                </div>

                {/* Subject CBT Test Items */}
                <div className="space-y-3">
                  {(subjectWiseMap[activeSubject] || []).map((item, idx) => {
                    const isItemOpen = isUnlocked || item.isFreeDemo;
                    return (
                      <div
                        key={item._id || idx}
                        className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-50 text-purple-700 uppercase">
                              CBT Exam
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                            {item.isFreeDemo && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase">
                                Free Demo
                              </span>
                            )}
                            {item.isAttempted && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded-full flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-blue-600 inline" />
                                <span>Attempted{item.latestAttempt?.score !== undefined ? ` (${item.latestAttempt.score}/${item.latestAttempt.totalMarks})` : ''}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Focused sectional test for {activeSubject} • {item.totalQuestions || 50} MCQs
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          {isItemOpen ? (
                            item.isAttempted ? (
                              <Link
                                to={`/attempt/${item.testPaperId || item._id}`}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5 transition"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Retake Test</span>
                              </Link>
                            ) : (
                              <Link
                                to={`/attempt/${item.testPaperId || item._id}`}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5 transition"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>Start CBT Test</span>
                              </Link>
                            )
                          ) : (
                            <button
                              onClick={handleBuyNow}
                              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Unlock Full Pack</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500 py-8">No subject-wise tests uploaded yet.</p>
            )}
          </div>
        )}
      </div>

      {/* PDF Modal Viewer */}
      <PdfViewerModal
        isOpen={previewPdf.isOpen}
        onClose={() => setPreviewPdf({ isOpen: false, url: '', title: '' })}
        pdfUrl={previewPdf.url}
        title={previewPdf.title}
      />
    </div>
  );
};

export default TestSeriesDetail;
