import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Clock,
  Play,
  Lock,
  Search,
  Filter,
  Zap,
  ShoppingCart,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

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

  const exams = ['All', 'AIIMS', 'GSSSB', 'ESIC', 'BFUHS', 'OSSSC', 'UPSSSC', 'MP', 'Bihar'];

  useEffect(() => {
    fetchPapers();
  }, [selectedExam]);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/single-models', {
        params: { examType: selectedExam },
      });
      if (res.data.success) {
        setPapers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load single model papers', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = papers.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-blue-200">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Pillar 3: Pure Online CBT Practice Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Single Model Papers (Online CBT Simulator)
          </h1>
          <p className="text-sm text-blue-100/90 leading-relaxed">
            Real government pharmacist examination simulation with 100 MCQs, 100 minutes countdown timer, -0.25 negative marking, and instant AI performance scorecard.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Exam Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {exams.map(exam => (
            <button
              key={exam}
              onClick={() => setSelectedExam(exam)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                selectedExam === exam
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {exam}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search model paper..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition"
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
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Model Papers Found</h3>
          <p className="text-xs text-slate-500">Try selecting another exam category or clearing your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map(paper => {
            const isPurchased =
              paper.isFree ||
              user?.role === 'admin' ||
              (user?.purchasedSingleModels || []).some(
                id => (id?._id || id)?.toString() === paper._id?.toString()
              );

            return (
              <div
                key={paper._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700">
                      {paper.examType}
                    </span>
                    {paper.isFree ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        Free Demo
                      </span>
                    ) : isPurchased ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        ✓ Enrolled
                      </span>
                    ) : (
                      <span className="text-xs font-extrabold text-slate-900">
                        ₹{paper.discountPrice !== null && paper.discountPrice !== undefined ? paper.discountPrice : paper.price}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                    {paper.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {paper.description || 'Full syllabus official practice model paper with negative marking.'}
                  </p>

                  <div className="flex items-center space-x-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <span>⏱️ {paper.durationMinutes || 100} Mins</span>
                    <span>📝 {paper.totalQuestions || 100} MCQs</span>
                    <span>-0.25 Marking</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  {isPurchased ? (
                    paper.testPaperId ? (
                      <Link
                        to={`/attempt/${paper.testPaperId._id || paper.testPaperId}`}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>{paper.isFree ? 'Start Free CBT Mock Exam' : 'Take Online CBT Exam'}</span>
                      </Link>
                    ) : (
                      <div className="w-full py-2.5 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl text-center">
                        CBT Questions Coming Soon
                      </div>
                    )
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAddToCart(paper)}
                        className="p-3 rounded-xl border border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-700 transition cursor-pointer"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          addToCart(paper, 'SingleModelPaper');
                          navigate('/checkout');
                        }}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Buy Now (₹{paper.discountPrice || paper.price})</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SingleModelPapers;
