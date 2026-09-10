import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import HeroBanner from '../components/common/HeroBanner';
import FilterPills from '../components/common/FilterPills';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import SingleModelCard from '../components/common/cards/SingleModelCard';
import SEO from '../components/common/SEO';
import { EXAM_TYPES } from '../constants/exams';

const SingleModelPapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState('All');
  const [search, setSearch] = useState('');

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = (paper) => {
    const res = addToCart(paper, 'SingleModelPaper');
    if (res?.added) {
      showToast(`${paper.title} added to cart!`, 'success');
    } else {
      showToast(res?.message || 'Item is already in cart', 'info');
    }
  };

  const handleBuyNow = (paper) => {
    addToCart(paper, 'SingleModelPaper');
    navigate('/checkout');
  };

  useEffect(() => {
    fetchPapers();
  }, [selectedExam]);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      let query = '';
      if (selectedExam !== 'All') {
        query = `?examType=${encodeURIComponent(selectedExam)}`;
      }
      const res = await api.get(`/single-models${query}`);
      if (res.data.success) {
        setPapers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load single model papers', err);
      showToast('Unable to load model papers. Please check your internet connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = papers.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SEO
        title="Single Model Papers & CBT Mock Tests"
        description="Practice single model papers for GSSSB, UPSSSC, RRB, and AIIMS pharmacist exams. Authentic CBT testing environment with countdown timer and instant analysis."
        path="/model-papers"
      />
      {/* Header Banner */}
      <HeroBanner
        pill="Online CBT Practice Engine"
        title="Single Model Papers (Online CBT Simulator)"
        subtitle="Real government pharmacist examination simulation with 100 MCQs, 100 minutes countdown timer, -0.25 negative marking, and instant performance scorecard."
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <FilterPills
          items={EXAM_TYPES}
          activeItem={selectedExam}
          onSelect={setSelectedExam}
        />

        <div className="w-full md:w-72">
          <SearchInput
            placeholder="Search model paper..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500">Loading authentic model papers...</p>
        </div>
      ) : filteredPapers.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No Model Papers Found"
          subtitle="Try selecting another exam category or clearing your search."
          actionText="View All Exams"
          onAction={() => {
            setSelectedExam('All');
            setSearch('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => {
            const isPurchased =
              paper.isFree ||
              user?.role === 'admin' ||
              (user?.purchasedSingleModels || []).some(
                (id) => (id?._id || id)?.toString() === paper._id?.toString()
              );

            return (
              <SingleModelCard
                key={paper._id}
                paper={paper}
                isPurchased={isPurchased}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                variant="marketplace"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SingleModelPapers;
