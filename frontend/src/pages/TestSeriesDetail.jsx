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
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import PdfViewerModal from '../components/common/PdfViewerModal';

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
  const navigate = useNavigate();

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
  const mcqPdfsList = folders?.mcqPdfs || [];
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

            {/* Folder Summary Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                <span className="text-slate-400 text-[11px] block font-semibold">📁 Folder 1</span>
                <span className="font-bold text-sm sm:text-base text-white">{cbtMixedList.length || series.totalTests || 0} Mixed CBTs</span>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                <span className="text-slate-400 text-[11px] block font-semibold">📁 Folder 2</span>
                <span className="font-bold text-sm sm:text-base text-white">{pyqsList.length} Past PYQs</span>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                <span className="text-slate-400 text-[11px] block font-semibold">📁 Folder 3</span>
                <span className="font-bold text-sm sm:text-base text-white">{mcqPdfsList.length} MCQ PDFs</span>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                <span className="text-slate-400 text-[11px] block font-semibold">📁 Folder 4</span>
                <span className="font-bold text-sm sm:text-base text-white">{subjectKeys.length} Subjects Drill</span>
              </div>
            </div>
          </div>

          {/* Pricing & CTA Box */}
          <div className="lg:col-span-4 bg-white text-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-baseline space-x-2">
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
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p className="flex items-center space-x-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>🟢 1 Free Demo Unlocked in Every Folder</span>
              </p>
              <p className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Includes all 4 sub-folders with 365-day access</span>
              </p>
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
                  onClick={() => addToCart(series)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4-FOLDER INTERACTIVE EXPLORER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
              <Layers className="w-6 h-6 text-blue-600" />
              <span>Package Content Folders</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore tests and study PDFs across 4 specialized folders. Free demo items are unlocked!
            </p>
          </div>
        </div>

        {/* 4 Folder Navigation Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 bg-slate-100/80 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveFolderTab('cbtMixed')}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center space-x-2 ${
              activeFolderTab === 'cbtMixed'
                ? 'bg-white text-blue-600 shadow-md font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📁 1. CBT Mocks</span>
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
            <span>📁 2. Past PYQs</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 text-indigo-700">
              {pyqsList.length || 2}
            </span>
          </button>

          <button
            onClick={() => setActiveFolderTab('mcqPdfs')}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center space-x-2 ${
              activeFolderTab === 'mcqPdfs'
                ? 'bg-white text-blue-600 shadow-md font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📁 3. MCQ PDFs</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-700">
              {mcqPdfsList.length || 2}
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
            <span>📁 4. Subject-Wise</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700">
              {subjectKeys.length || 2}
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
                          <span>Negative Marking (-0.25)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-center">
                      {isItemOpen ? (
                        <Link
                          to={`/attempt/${item.testPaperId || item._id}`}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition flex items-center space-x-2"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>Start CBT Test</span>
                        </Link>
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
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>⏱️ {paper.durationMinutes || 120} Mins</span>
                          <span>📝 {paper.questionsCount || 100} MCQs</span>
                          <span>Negative Marking (-0.25)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-center">
                      {isPaperOpen ? (
                        <Link
                          to={`/attempt/${paper._id}`}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition flex items-center space-x-2"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>Start CBT Test</span>
                        </Link>
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
              <p className="text-center text-sm text-slate-500 py-8">No CBT papers in this folder yet.</p>
            )}
          </div>
        )}

        {/* FOLDER 2: PYQs (CBT OR PDF) */}
        {activeFolderTab === 'pyqs' && (
          <div className="space-y-3">
            {pyqsList.length > 0 ? (
              pyqsList.map((item, idx) => {
                const isItemOpen = isUnlocked || item.isFreeDemo;
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
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Official Solved Exam Paper with Step-by-Step Answer Key & Explanations ({item.year || 2023})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      {isItemOpen ? (
                        <>
                          <button
                            onClick={() =>
                              setPreviewPdf({
                                isOpen: true,
                                url: item.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                                title: item.title,
                              })
                            }
                            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview Online</span>
                          </button>
                          <a
                            href={item.pdfUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition shadow"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </a>
                        </>
                      ) : (
                        <button
                          onClick={handleBuyNow}
                          className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5"
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
              <p className="text-center text-sm text-slate-500 py-8">No PYQ papers uploaded in this folder yet.</p>
            )}
          </div>
        )}

        {/* FOLDER 3: MIXED MCQ PDFS */}
        {activeFolderTab === 'mcqPdfs' && (
          <div className="space-y-3">
            {mcqPdfsList.length > 0 ? (
              mcqPdfsList.map((item, idx) => {
                const isItemOpen = isUnlocked || item.isFreeDemo;
                return (
                  <div
                    key={item._id || idx}
                    className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5" />
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
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Comprehensive Question Bank PDF ({item.totalQuestions || 500} Practice MCQs)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      {isItemOpen ? (
                        <>
                          <button
                            onClick={() =>
                              setPreviewPdf({
                                isOpen: true,
                                url: item.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                                title: item.title,
                              })
                            }
                            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <a
                            href={item.pdfUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition shadow"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </a>
                        </>
                      ) : (
                        <button
                          onClick={handleBuyNow}
                          className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5"
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
              <p className="text-center text-sm text-slate-500 py-8">No MCQ PDFs uploaded in this folder yet.</p>
            )}
          </div>
        )}

        {/* FOLDER 4: SUBJECT-WISE PREPARATION */}
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

                {/* Subject Items */}
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
                              {item.contentType === 'cbt' ? 'CBT Test' : item.contentType === 'notes_pdf' ? 'Revision Notes' : 'MCQ PDF'}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                            {item.isFreeDemo && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase">
                                Free Demo
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Focused sectional drill for {activeSubject}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          {isItemOpen ? (
                            item.contentType === 'cbt' ? (
                              <Link
                                to={`/attempt/${item.testPaperId || item._id}`}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>Start Quiz</span>
                              </Link>
                            ) : (
                              <button
                                onClick={() =>
                                  setPreviewPdf({
                                    isOpen: true,
                                    url: item.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                                    title: item.title,
                                  })
                                }
                                className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center space-x-1.5"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Read Notes</span>
                              </button>
                            )
                          ) : (
                            <button
                              onClick={handleBuyNow}
                              className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Locked</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500 py-8">No subject-wise items uploaded yet.</p>
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
