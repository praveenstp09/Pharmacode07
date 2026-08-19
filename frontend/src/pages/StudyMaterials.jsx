import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  Search,
  Filter,
  Lock,
  CheckCircle2,
  BookOpen,
  Tag,
  ShoppingCart,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const StudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedExam, setSelectedExam] = useState('All');

  const { user } = useAuth();
  const { addToCart } = useCart();

  const categories = ['All', 'Notes', 'PDF Notes', 'Short Notes', 'PYQ', 'Drug Lists', 'Formula Sheets'];
  const exams = ['All', 'GSSSB', 'UPSSSC', 'RRB', 'AIIMS'];

  useEffect(() => {
    fetchMaterials();
  }, [selectedCat, selectedExam]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let query = `?category=${selectedCat}&examType=${selectedExam}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(`/materials${query}`);
      if (res.data.success) {
        setMaterials(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load study materials', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = e => {
    e.preventDefault();
    fetchMaterials();
  };

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-lg space-y-4">
        <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Digital Notes & Pharmacy Library
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold">
          Pharmacy Study Materials & PDF Notes
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
          High-yield summary notes, drug classification charts, and formula sheets compiled for quick revision.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="pt-2 max-w-xl flex items-center gap-2">
          <div className="relative flex-grow">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search PDF notes or drug charts..."
              className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-sm text-white rounded-xl shadow transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCat === cat
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Materials List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 font-semibold text-sm">Loading materials...</p>
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No materials found</h3>
          <p className="text-xs text-slate-500">Try selecting another category or resetting filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map(item => {
            const isPurchased = user?.purchasedMaterials?.some(
              m => (m._id || m) === item._id
            );
            const isUnlocked = !item.isPaid || isPurchased || user?.role === 'admin';

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                      {item.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {item.examType || 'All Exams'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {item.isPaid ? (
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-lg font-extrabold text-slate-900">
                          ₹{item.discountPrice || item.price}
                        </span>
                        {item.price > (item.discountPrice || item.price) && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{item.price}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm font-extrabold text-emerald-600 uppercase">
                        Free PDF
                      </span>
                    )}
                  </div>

                  <div>
                    {isUnlocked ? (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Buy (₹{item.discountPrice})</span>
                      </button>
                    )}
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

export default StudyMaterials;
