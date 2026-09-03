import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  FileCheck,
  BookOpen,
  CheckCircle2,
  ShoppingCart,
  Star,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CardSkeleton from '../components/common/SkeletonCard';

const TestSeriesMarketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState(searchParams.get('exam') || 'All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleAddToCart = (item) => {
    const res = addToCart(item);
    if (res?.added) {
      showToast(`${item.title} added to cart!`, 'success');
    } else {
      showToast(res?.message || 'Item is already in cart', 'info');
    }
  };

  const exams = [
    'All',
    'GSSSB',
    'ESIC',
    'AIIMS',
    'BFUHS',
    'OSSSC',
    'UPSSSC',
    'MP Vyapam',
    'Bihar BTSC',
    'RRB',
    'State Exams',
  ];
  const categories = ['All', 'Competitive Exam', 'Model Paper', 'Previous Year'];

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSeries();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedExam, selectedCategory, sortBy]);

  const fetchSeries = async () => {
    setLoading(true);
    try {
      let query = `?examType=${selectedExam}&category=${selectedCategory}`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      if (sortBy) query += `&sort=${sortBy}`;

      const res = await api.get(`/test-series${query}`);
      if (res.data.success) {
        setSeriesList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch test series', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = e => {
    e.preventDefault();
    fetchSeries();
  };

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-lg space-y-4">
        <span className="bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Pharmacist Mock Test Marketplace
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Exam-Oriented Model Papers & Test Series
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
          Prepare with PYQ (Previous Year Paper) and Model papers designed specifically for state & central pharmacist recruitment examinations.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl flex items-center gap-2">
          <div className="relative flex-grow">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by exam name (e.g. GSSSB, UPSSSC)..."
              className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 font-bold text-sm text-white rounded-xl shadow transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        {/* Exam Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" />
            Exam:
          </span>
          {exams.map(exam => (
            <button
              key={exam}
              onClick={() => {
                setSelectedExam(exam);
                setSearchParams(exam === 'All' ? {} : { exam });
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedExam === exam
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {exam}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-500">Sort by:</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Latest Added</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Most Questions</option>
          </select>
        </div>
      </div>

      {/* Test Series Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <CardSkeleton key={idx} />
          ))}
        </div>
      ) : seriesList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No test series found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or selecting "All" from the exam filter tabs.
          </p>
          <button
            onClick={() => {
              setSelectedExam('All');
              setSelectedCategory('All');
              setSearch('');
            }}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {seriesList.map(item => {
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
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    loading="lazy"
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

                {/* Body */}
                <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition">
                      <Link to={`/test-series/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Highlights list */}
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
                      {isPurchased || item.isFree ? (
                        <Link
                          to={`/test-series/${item.slug}`}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition"
                        >
                          {isPurchased ? 'Enrolled (Start Test)' : 'Start Free Test'}
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
                            Buy Now
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
  );
};

export default TestSeriesMarketplace;
