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
  Share2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const TestSeriesDetail = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/test-series/${slug}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load test series');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-semibold">Loading test series details...</p>
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

  const { series, papers } = data;
  const isPurchased = user?.purchasedTests?.some(
    t => (t._id || t) === series._id
  );

  const handleBuyNow = () => {
    addToCart(series);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/test-series" className="hover:text-blue-600">Test Series</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 truncate">{series.title}</span>
      </div>

      {/* Hero Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500 text-white font-extrabold text-xs px-3 py-1 rounded-md uppercase tracking-wider">
                {series.examType} Special
              </span>
              <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-xs px-2.5 py-1 rounded-md">
                120 MCQs Pattern
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
              {series.title}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {series.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center space-x-1.5">
                <FileCheck className="w-4 h-4 text-blue-400" />
                <span><strong>{papers.length}</strong> Full Mock Tests</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span><strong>{series.totalQuestions}</strong> High-Yield MCQs</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span><strong>120 Mins</strong> / Test</span>
              </div>
            </div>
          </div>

          {/* Pricing & Checkout Box */}
          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-white space-y-5">
            <div>
              <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
                Package Price
              </span>
              {series.isFree ? (
                <div className="text-3xl font-extrabold text-emerald-400 mt-1">FREE</div>
              ) : (
                <div className="flex items-baseline space-x-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    ₹{series.discountPrice}
                  </span>
                  {series.price > series.discountPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      ₹{series.price}
                    </span>
                  )}
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                    {Math.round(((series.price - series.discountPrice) / series.price) * 100)}% OFF
                  </span>
                </div>
              )}
            </div>

            {isPurchased ? (
              <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-xl text-center space-y-1">
                <div className="font-bold text-emerald-300 text-sm flex items-center justify-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Enrolled & Active</span>
                </div>
                <p className="text-xs text-slate-300">All test papers are unlocked below!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-lg transition transform hover:-translate-y-0.5 text-sm flex items-center justify-center space-x-2"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now (Instant Access)</span>
                </button>
                <button
                  type="button"
                  onClick={() => addToCart(series)}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            )}

            <div className="text-[11px] text-slate-300 text-center space-y-1">
              <p>🔒 100% Safe & Secure Indian Payment Gateway</p>
              <p>Instant activation on Student Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Package Syllabus & Highlights */}
      {series.highlights && series.highlights.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">What You Get in This Test Series:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
            {series.highlights.map((h, i) => (
              <div key={i} className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="font-medium">{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List of Included Test Papers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Included Mock Test Papers ({papers.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Each test contains 120 MCQs with instant scoring and detailed clinical explanations.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {papers.map((paper, idx) => {
            const canAttempt = isPurchased || series.isFree;

            return (
              <div
                key={paper._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-blue-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-base sm:text-lg">
                      {paper.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span>Questions: <strong className="text-slate-800">{paper.questionsCount || 120}</strong></span>
                      <span>•</span>
                      <span>Marks: <strong className="text-slate-800">{paper.totalMarks}</strong></span>
                      <span>•</span>
                      <span>Duration: <strong className="text-slate-800">{paper.durationMinutes} Mins</strong></span>
                      <span>•</span>
                      <span>Negative: <strong className="text-rose-600">-{paper.negativeMarks}</strong></span>
                    </div>
                  </div>
                </div>

                <div>
                  {canAttempt ? (
                    <Link
                      to={`/attempt/${paper._id}`}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Test</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 transition"
                    >
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Unlock Test</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TestSeriesDetail;
