import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Zap,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CardSkeleton from '../components/common/SkeletonCard';
import HeroBanner from '../components/common/HeroBanner';
import FilterPills from '../components/common/FilterPills';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import StudyPackCard from '../components/common/cards/StudyPackCard';
import SEO from '../components/common/SEO';

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
        setPacks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch study packs', err);
      showToast('Unable to load study packs. Please check your internet connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isUserEnrolled = (packId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return (user.purchasedStudyPacks || []).some(
      (p) => (p?._id || p)?.toString() === packId?.toString()
    );
  };

  const handleAddToCart = (pack) => {
    const res = addToCart(pack, 'StudyPack');
    if (res?.added) {
      showToast(`${pack.title} added to cart!`, 'success');
    } else {
      showToast(res?.message || 'Item is already in cart', 'info');
    }
  };

  const handleSelectCourse = (courseValue) => {
    setSelectedCourse(courseValue);
    if (courseValue === 'All') {
      searchParams.delete('course');
    } else {
      searchParams.set('course', courseValue);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <SEO
        title="Pharmacy Study Materials & PDF Notes Packages"
        description="Download semester-wise B.Pharm notes, D.Pharm curriculum books, and high-yield revision PDF packs for competitive pharmacist exam preparation."
        path="/materials"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero */}
        <HeroBanner
          pill="Complete Digital Notes Packages"
          title="Pharmacy Study Materials & PDF Packages"
          subtitle="Unlock semester-wise B.Pharm notes, D.Pharm curriculum guides, and high-yield pharmacist exam quick revision PDFs in organized, downloadable bundles."
        />

        {/* Filter Navigation Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <FilterPills
            items={courses}
            activeItem={selectedCourse}
            onSelect={handleSelectCourse}
          />

          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search by package title, semester, or topics covered..."
          />
        </div>

        {/* Content Listing */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : packs.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Study Material Packages Found"
            subtitle="We couldn't find any packages matching your filter criteria. Try resetting filters or searching with different keywords."
            actionText="Reset Filters"
            onAction={() => {
              handleSelectCourse('All');
              setSearch('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map((pack) => (
              <StudyPackCard
                key={pack._id}
                pack={pack}
                isPurchased={isUserEnrolled(pack._id)}
                onAddToCart={handleAddToCart}
                variant="marketplace"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPackMarketplace;
