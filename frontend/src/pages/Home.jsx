import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Users,
  Zap,
  TrendingUp,
  FileCheck,
  Star,
  ChevronRight,
  HelpCircle,
  Play,
  ShoppingCart,
  Download,
  Mail,
  MessageSquare,
  Send,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import CardSkeleton from '../components/common/SkeletonCard';

const Home = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [featuredSeries, setFeaturedSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  // Contact Admin Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [contactSending, setContactSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = async e => {
    e.preventDefault();
    setContactSending(true);
    try {
      const res = await api.post('/contact', contactForm);
      if (res.data.success) {
        setContactSuccess(true);
        setContactForm({ name: '', email: '', subject: 'General Inquiry', message: '' });
        showToast('Message sent! Our support team will get back to you shortly.', 'success');
        setTimeout(() => setContactSuccess(false), 7000);
      }
    } catch (err) {
      showToast('Failed to send message: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setContactSending(false);
    }
  };

  const handleAddToCart = (item) => {
    const res = addToCart(item);
    if (res?.added) {
      showToast(`${item.title} added to cart!`, 'success');
    } else {
      showToast(res?.message || 'Item is already in cart', 'info');
    }
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/test-series');
        if (res.data.success) {
          setFeaturedSeries(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching series', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const faqs = [
    {
      q: 'How do I purchase the GSSSB Junior Pharmacist 120 MCQ Model Papers?',
      a: 'Click on the "Buy Now" button on the test series card. You can apply discount coupons like PHARMA10 at checkout and pay instantly via UPI, Cards, or NetBanking. The test papers unlock automatically in your Student Dashboard.',
    },
    {
      q: 'Are the test papers based on the latest 2026 syllabus?',
      a: 'Yes, all our Model Papers and Mock Tests are strictly curated according to the latest GSSSB, UPSSSC, and RRB pharmacist exam notifications, covering Pharmacology, Pharmaceutics, Pharmacognosy, Jurisprudence, HAP, and Clinical Pharmacy.',
    },
    {
      q: 'Can I reattempt the mock tests after submitting?',
      a: 'Yes! You can reattempt any test multiple times to improve your speed and accuracy. Your score history is tracked in your student dashboard.',
    },
    {
      q: 'Do I get detailed explanations for incorrect answers?',
      a: 'Immediately after submitting your test, you receive a full question-wise solution with the correct answer, your chosen response, and in-depth clinical/pharmacological explanations.',
    },
    {
      q: 'Can I access the website on mobile phones?',
      a: 'Absolutely! PharmaCode07 is 100% mobile responsive. You can attempt tests and read PDF notes comfortably on any Android phone, iPhone, tablet, or laptop.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white pt-12 pb-20 sm:pt-16 sm:pb-28">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-400/30 px-3.5 py-1.5 rounded-full text-blue-300 text-xs sm:text-sm font-semibold backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>#1 Preparation Platform for Pharmacist Exams</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Master Your Pharmacy Exams with{' '}
                <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  our Test Series & Model Papers
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Specialized test series and model papers for{' '}
                <strong className="text-white font-semibold">
                  ESIC, AIIMS, BFUHS, OSSSC, GSSSB, UPSSSC, MP, Bihar & All State Pharmacist Exams
                </strong>
                . Practice with real exam timers, negative marking (-0.25), and instant comprehensive explanations.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link
                  to="/test-series"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition transform hover:-translate-y-0.5 text-center flex items-center justify-center space-x-2 text-base"
                >
                  <span>Explore Model Papers</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/practice"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold backdrop-blur-sm transition text-center flex items-center justify-center space-x-2 text-base"
                >
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  <span>Free MCQ Practice</span>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>120 MCQs Pattern</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Negative Marking (-0.25)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant Detailed Solutions</span>
                </div>
              </div>

              {/* Target State & Central Exams Bar */}
              <div className="pt-4 space-y-2 text-left">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Targeted Pharmacist Exams:
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'ESIC',
                    'AIIMS',
                    'BFUHS',
                    'OSSSC',
                    'GSSSB',
                    'UPSSSC',
                    'MP Vyapam',
                    'Bihar BTSC',
                    'All State Exams',
                  ].map(badge => (
                    <Link
                      key={badge}
                      to={`/test-series?exam=${encodeURIComponent(badge)}`}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-blue-600/40 border border-white/15 text-[11px] font-bold text-blue-200 hover:text-white transition"
                    >
                      {badge}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Hero Graphic: Real Test Interface Mockup */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-5 transform hover:scale-[1.02] transition">
                {/* Header of Mock card */}
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-800">
                    ⏱️ 01:58:45
                  </span>
                </div>

                {/* Exam Title */}
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                    Live Model Paper 1
                  </span>
                  <h4 className="text-base font-bold text-white">
                    GSSSB Junior Pharmacist 2026
                  </h4>
                  <p className="text-xs text-slate-400">Total: 120 Questions | Duration: 120 Mins</p>
                </div>

                {/* Sample Question Preview */}
                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-3 text-left">
                  <div className="text-xs font-bold text-blue-400">Q.14 (Pharmacology)</div>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                    Which of the following is considered the drug of choice for Anaphylactic Shock?
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="p-2 rounded-lg bg-blue-600/30 border border-blue-500/50 text-white font-semibold flex items-center justify-between">
                      <span>A. Adrenaline (Epinephrine)</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                      B. Atropine Sulphate
                    </div>
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                      C. Dopamine HCl
                    </div>
                  </div>
                </div>

                {/* Bottom live stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-950/50 border border-emerald-800/40 p-2 rounded-lg">
                    <div className="font-bold text-emerald-400 text-sm">98.4%</div>
                    <div className="text-[10px] text-slate-400">Accuracy</div>
                  </div>
                  <div className="bg-blue-950/50 border border-blue-800/40 p-2 rounded-lg">
                    <div className="font-bold text-blue-400 text-sm">Rank 12</div>
                    <div className="text-[10px] text-slate-400">State Level</div>
                  </div>
                  <div className="bg-purple-950/50 border border-purple-800/40 p-2 rounded-lg">
                    <div className="font-bold text-purple-400 text-sm">+108.5</div>
                    <div className="text-[10px] text-slate-400">Net Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-5 sm:p-8">
          <div className="flex items-center space-x-3.5 border-r border-slate-100 last:border-0 pr-2">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">120 MCQs</div>
              <div className="text-xs text-slate-500 font-medium">Standard Model Papers</div>
            </div>
          </div>
          <div className="flex items-center space-x-3.5 border-r border-slate-100 last:border-0 pr-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">100% CBT</div>
              <div className="text-xs text-slate-500 font-medium">Real Exam Timer Simulation</div>
            </div>
          </div>
          <div className="flex items-center space-x-3.5 border-r border-slate-100 last:border-0 pr-2">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">Negative Mark</div>
              <div className="text-xs text-slate-500 font-medium">-0.25 Strict Calculation</div>
            </div>
          </div>
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">Instant</div>
              <div className="text-xs text-slate-500 font-medium">Detailed Question Analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED MODEL PAPERS / TEST SERIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-blue-600 font-extrabold text-xs tracking-wider uppercase">
              Exam Oriented Packages
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              Top Pharmacist Model Test Papers
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl">
              Strictly prepared by expert pharmacy faculties according to latest recruitment guidelines.
            </p>
          </div>
          <Link
            to="/test-series"
            className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 font-bold text-sm"
          >
            <span>View All Exam Papers</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <CardSkeleton key={idx} />
            ))
          ) : featuredSeries.map(item => {
            const isPurchased =
              user?.role === 'admin' ||
              (user?.purchasedTests || []).some(
                t => (t?._id || t)?.toString() === item._id?.toString()
              );

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Card Image / Badge */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  {/* <div className="absolute top-3 left-3 bg-blue-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
                    {item.examType}
                  </div> */}
                  {item.price > item.discountPrice && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white font-bold text-xs px-2 py-1 rounded-md shadow">
                      {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <FileCheck className="w-3.5 h-3.5 text-blue-300" />
                      <span>{item.totalTests || 1} Tests</span>
                    </span>
                    {item.totalQuestions > 0 ? (
                      <span className="flex items-center space-x-1">
                        <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                        <span>{item.totalQuestions} MCQs</span>
                      </span>
                    ) : item.totalPdfs > 0 ? (
                      <span className="flex items-center space-x-1">
                        <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                        <span>{item.totalPdfs} Solved PDFs</span>
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition">
                      <Link to={`/test-series/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Highlights */}
                  {item.highlights && item.highlights.length > 0 && (
                    <div className="space-y-1.5 py-2 border-t border-b border-slate-100 text-xs text-slate-600">
                      {item.highlights.slice(0, 3).map((h, i) => (
                        <div key={i} className="flex items-start space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pricing & CTA */}
                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      {item.isFree ? (
                        <span className="text-xl font-extrabold text-emerald-600">FREE</span>
                      ) : (
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-extrabold text-slate-900">
                            ₹{item.discountPrice}
                          </span>
                          {item.price > item.discountPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{item.price}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {isPurchased ? (
                        <Link
                          to={`/test-series/${item.slug}`}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition"
                        >
                          Enrolled (Start Test)
                        </Link>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-700 transition cursor-pointer"
                            title="Add to Cart"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/test-series/${item.slug}`}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition"
                          >
                            {item.isFree ? 'Start Test' : 'Buy Now'}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. WHY CHOOSE PHARMACODE07 */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-blue-400 font-extrabold text-xs tracking-wider uppercase">
              Designed For High Ranking
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Why Students Trust PharmaCode07
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              A comprehensive CBT testing environment that gives you the exact feel of government pharmacist recruitment examinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/80 border border-slate-700/80 p-6 sm:p-8 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Real CBT Exam Simulation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Experience the authentic examination hall environment with auto-submitting countdown timers and responsive question palettes.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 p-6 sm:p-8 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Subject-Wise Breakdown</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Questions are balanced across Pharmacology, Pharmaceutics, Pharmacognosy, Pharmaceutical Analysis, Jurisprudence, and Clinical Pharmacy.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 p-6 sm:p-8 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Instant Explanations & Reattempts</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Review your weak areas with comprehensive explanations for all 120 questions. Reattempt tests to reach 100% confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FREE PRACTICE MCQS & STUDY MATERIALS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Box 1: Free Daily MCQ Practice */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-3 relative z-10">
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                100% Free Practice
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Daily Subject-Wise MCQ Challenge
              </h3>
              <p className="text-blue-100 text-sm sm:text-base">
                Sharpen your concepts with unlimited free practice questions covering Pharmacology, Chemistry, and Dispensing.
              </p>
            </div>
            <div className="relative z-10">
              <Link
                to="/practice"
                className="inline-flex items-center space-x-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-6 py-3 rounded-xl shadow transition"
              >
                <span>Start Free Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Box 2: High Yield Study Notes & PYQs */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl border border-slate-700 flex flex-col justify-between space-y-6">
            <div className="space-y-3 relative z-10">
              <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Digital Notes & PYQs
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Download PDF Notes & Solved Papers
              </h3>
              <p className="text-slate-300 text-sm sm:text-base">
                Access authentic previous year question papers (2022–2025) and quick revision one-liners for your upcoming exam.
              </p>
            </div>
            <div className="relative z-10">
              <Link
                to="/materials"
                className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow transition"
              >
                <Download className="w-4 h-4" />
                <span>Browse Study Materials</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <span className="text-blue-600 font-extrabold text-xs tracking-wider uppercase">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Have Questions? We've Got Answers.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-slate-900 font-bold text-base sm:text-lg hover:text-blue-600 transition"
                >
                  <span>{faq.q}</span>
                  <span className="ml-4 text-slate-400 text-xl font-bold">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. BOTTOM CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold">
            Ready to Crack Your Pharmacist Recruitment Exam?
          </h2>
          <p className="text-blue-200 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Join thousands of pharmacy aspirants preparing with PharmaCode07. Start practicing with our 4-Folder Test Series and high-yield notes today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/test-series"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-blue-900 font-extrabold rounded-xl shadow-lg hover:bg-yellow-300 transition text-base"
            >
              Explore Test Series Now →
            </Link>
            <Link
              to="/materials"
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-950/60 hover:bg-blue-950 border border-white/20 text-white font-semibold rounded-xl transition text-base"
            >
              🎓 Free Study Notes & PYQs
            </Link>
          </div>
        </div>
      </section>

      {/* 8. CONTACT ADMIN & STUDENT QUERY SECTION (BEFORE FOOTER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct Support to Students</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Have a Doubt or Need Help? Contact Admin
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Facing issues with test access, notes download, payment, or have a question regarding pharmacy exams? Send a direct message and our admin team will reply to your email promptly.
            </p>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-slate-700 block">Official Support Email</span>
                <a href="mailto:pharmacode07exams@gmail.com" className="font-extrabold text-blue-600 hover:underline">
                  pharmacode07exams@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200">
            {contactSuccess && (
              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>🎉 Message sent successfully! Admin will respond to your email shortly.</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Your Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Subject / Category</label>
                <select
                  value={contactForm.subject}
                  onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Test Series Access">Test Series / CBT Access Query</option>
                  <option value="Study Materials & Notes">Study Notes / PYQ Request</option>
                  <option value="Payment or Order Issue">Payment / Order Issue</option>
                  <option value="Other Feedback">Suggestion / Other Feedback</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Your Message</label>
                <textarea
                  rows={3}
                  required
                  value={contactForm.message}
                  onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Describe your doubt or question in detail..."
                  className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={contactSending}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm"
              >
                {contactSending ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message Directly to Admin</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
