import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  BookOpen,
  FileText,
  CheckCircle2,
  ShoppingCart,
  Sparkles,
  GraduationCap,
  Zap,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CardSkeleton from '../components/common/SkeletonCard';

const StudyPackMarketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(searchParams.get('course') || 'All');

  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const courses = [
    { label: 'All Materials', value: 'All', icon: Layers },
    { label: 'B.Pharm (Sem 1-8)', value: 'B.Pharm', icon: GraduationCap },
    { label: 'D.Pharm (1st & 2nd Year)', value: 'D.Pharm', icon: BookOpen },
    { label: 'Quick Revision Notes', value: 'QuickRevision', icon: Zap },
    // { label: 'Special Bundles', value: 'Mixed', icon: Sparkles },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPacks();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCourse]);

  const fetchPacks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCourse !== 'All') params.courseType = selectedCourse;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/study-packs', { params });
      if (res.data.success) {
        setPacks(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching study material packages', err);
      showToast('Failed to load study materials. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (pack) => {
    const res = addToCart(pack, 'StudyPack');
    if (res?.added) {
      showToast(`${pack.title} added to cart!`, 'success');
    } else {
      showToast(res?.message || 'Item is already in your cart', 'info');
    }
  };

  const isUserEnrolled = (packId) => {
    if (!user) return false;
    const purchased = user.purchasedStudyPacks || [];
    return purchased.some((p) => (p?._id || p)?.toString() === packId?.toString());
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-blue-400/30">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span className="text-xs font-bold text-blue-200 tracking-wide uppercase">
                Complete Digital Notes Packages
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Pharmacy Study Materials & PDF Packages
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Unlock semester-wise B.Pharm notes, D.Pharm curriculum guides, and high-yield pharmacist exam quick revision PDFs in organized, downloadable bundles.
            </p>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          {/* Course Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {courses.map((course) => {
              const Icon = course.icon;
              const isActive = selectedCourse === course.value;
              return (
                <button
                  key={course.value}
                  onClick={() => {
                    setSelectedCourse(course.value);
                    if (course.value === 'All') {
                      searchParams.delete('course');
                    } else {
                      searchParams.set('course', course.value);
                    }
                    setSearchParams(searchParams);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{course.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by package title, semester, or topics covered..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Content Listing */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : packs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Study Material Packages Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              We couldn't find any packages matching your filter criteria. Try resetting filters or searching with different keywords.
            </p>
            <button
              onClick={() => {
                setSelectedCourse('All');
                setSearch('');
                searchParams.delete('course');
                setSearchParams(searchParams);
              }}
              className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow hover:bg-blue-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map((pack) => {
              const enrolled = isUserEnrolled(pack._id);
              const discountPercent =
                pack.price > pack.discountPrice
                  ? Math.round(((pack.price - pack.discountPrice) / pack.price) * 100)
                  : 0;

              return (
                <div
                  key={pack._id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col group"
                >
                  {/* Thumbnail / Header Area */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={pack.thumbnail || '/placeholder-notes.jpg'}
                      alt={pack.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                    {/* Course Badge */}
                    <div className="absolute top-3 left-3 bg-blue-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
                      {pack.courseType}
                    </div>

                    {/* Discount Badge */}
                    {discountPercent > 0 && !pack.isFree && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white font-bold text-xs px-2 py-1 rounded-md shadow">
                        {discountPercent}% OFF
                      </div>
                    )}

                    {/* Free Badge */}
                    {pack.isFree && (
                      <div className="absolute top-3 right-3 bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-md shadow uppercase tracking-wide">
                        100% FREE
                      </div>
                    )}

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold flex items-center justify-between">
                      <span className="flex items-center space-x-1.5 bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-md">
                        <FileText className="w-3.5 h-3.5 text-blue-300" />
                        <span>{pack.totalPdfs || 0} PDFs Included</span>
                      </span>
                      {pack.scopeLabel && (
                        <span className="bg-indigo-600/80 backdrop-blur-sm px-2.5 py-1 rounded-md">
                          {pack.scopeLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition">
                        {pack.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {pack.description}
                      </p>

                      {/* Highlights */}
                      {Array.isArray(pack.highlights) && pack.highlights.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          {pack.highlights.slice(0, 3).map((hl, i) => (
                            <div key={i} className="flex items-center space-x-2 text-xs text-slate-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                              <span className="truncate">{hl}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {pack.isFree ? (
                          <div className="text-emerald-600 font-extrabold text-lg">FREE</div>
                        ) : (
                          <div className="flex items-baseline space-x-2">
                            <span className="text-xl font-black text-slate-900">
                              ₹{pack.discountPrice}
                            </span>
                            {pack.price > pack.discountPrice && (
                              <span className="text-xs text-slate-400 line-through">
                                ₹{pack.price}
                              </span>
                            )}
                          </div>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium">365 Days Access</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {enrolled || pack.isFree ? (
                          <Link
                            to={`/study-materials/${pack.slug}`}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                          >
                            Open Material →
                          </Link>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAddToCart(pack)}
                              className="p-2.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl transition cursor-pointer"
                              title="Add to Cart"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/study-materials/${pack.slug}`}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                            >
                              View Pack →
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
        )}
      </div>
    </div>
  );
};

export default StudyPackMarketplace;
