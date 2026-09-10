import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, BookOpen } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CardSkeleton from '../components/common/SkeletonCard';
import HeroBanner from '../components/common/HeroBanner';
import FilterPills from '../components/common/FilterPills';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import TestSeriesCard from '../components/common/cards/TestSeriesCard';
import SEO from '../components/common/SEO';
import { EXAM_TYPES } from '../constants/exams';

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
      showToast('Unable to load test series. Please check your internet connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
    setSearchParams(exam === 'All' ? {} : { exam });
  };

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <SEO
        title="Pharmacist Test Series & Mock Papers"
        description="Explore comprehensive pharmacist test series, CBT mock exams, and previous year papers for GSSSB, UPSSSC, RRB, AIIMS, and GPAT."
        path="/test-series"
      />
      {/* Header Banner */}
      <HeroBanner
        pill="Pharmacist Mock Test Marketplace"
        title="Exam-Oriented Model Papers & Test Series"
        subtitle="Prepare with PYQ (Previous Year Paper) and Model papers designed specifically for state & central pharmacist recruitment examinations."
      >
        <div className="pt-2 max-w-xl">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search by exam name (e.g. GSSSB, UPSSSC)..."
          />
        </div>
      </HeroBanner>

      {/* Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        {/* Exam Pills */}
        <div className="flex items-center space-x-1.5 overflow-hidden">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center flex-shrink-0">
            <Filter className="w-3.5 h-3.5 mr-1" />
            Exam:
          </span>
          <FilterPills
            items={EXAM_TYPES}
            activeItem={selectedExam}
            onSelect={handleSelectExam}
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <label className="text-xs font-semibold text-slate-500">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
        <EmptyState
          icon={BookOpen}
          title="No test series found"
          subtitle='Try adjusting your search query or selecting "All" from the exam filter tabs.'
          actionText="Reset Filters"
          onAction={() => {
            handleSelectExam('All');
            setSelectedCategory('All');
            setSearch('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {seriesList.map((item) => {
            const isPurchased =
              user?.role === 'admin' ||
              (user?.purchasedTests || []).some(
                (t) => (t?._id || t)?.toString() === item._id?.toString()
              );

            return (
              <TestSeriesCard
                key={item._id}
                item={item}
                isPurchased={isPurchased}
                onAddToCart={handleAddToCart}
                variant="marketplace"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TestSeriesMarketplace;
