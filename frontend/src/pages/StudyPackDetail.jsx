import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Download,
  Eye,
  Lock,
  CheckCircle2,
  ShoppingCart,
  Zap,
  BookOpen,
  Layers,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import PdfViewerModal from '../components/common/PdfViewerModal';
import SEO from '../components/common/SEO';
import { downloadPdfToLocal } from '../utils/downloadHelper';

const StudyPackDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [pack, setPack] = useState(null);
  const [items, setItems] = useState([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);

  const [activeFolder, setActiveFolder] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');

  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    pdfUrl: '',
    title: '',
  });

  useEffect(() => {
    fetchPackDetails();
  }, [slug]);

  const fetchPackDetails = async () => {
    setLoading(false);
    try {
      setLoading(true);
      const res = await api.get(`/study-packs/${slug}`);
      if (res.data.success) {
        const { pack: packData, items: itemsData, isUnlocked: unlocked, isPurchased: purchased } = res.data.data;
        setPack(packData);
        setItems(itemsData || []);
        setIsUnlocked(Boolean(unlocked));
        setIsPurchased(Boolean(purchased));

        // Default active folder
        if (itemsData && itemsData.length > 0) {
          const firstFolder = itemsData[0].folderName;
          setActiveFolder(firstFolder);
        }
      }
    } catch (err) {
      console.error('Error loading package detail', err);
      showToast('Could not load study material package details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isQuickRevision =
    pack?.courseType === 'QuickRevision' ||
    Boolean(pack?.title?.toLowerCase().includes('quick'));

  // Standard B.Pharm Folders (Semesters)
  const folderNames = Array.from(new Set(items.map((it) => it.folderName))).filter(Boolean);
  const allUniqueSubjects = Array.from(new Set(items.map((it) => it.subjectName).filter(Boolean)));

  // Quick Notes: Group unique subjects from subjectName or falling back to folderName
  const quickSubjects = React.useMemo(() => {
    if (!isQuickRevision) return [];
    const map = new Map();
    items.forEach((it) => {
      const raw = (it.subjectName?.trim() || it.folderName?.trim() || 'General').trim();
      const lower = raw.toLowerCase();
      if (!map.has(lower)) {
        const displayName = raw.charAt(0).toUpperCase() + raw.slice(1);
        map.set(lower, { key: lower, name: displayName, count: 0 });
      }
      map.get(lower).count += 1;
    });
    return Array.from(map.values());
  }, [items, isQuickRevision]);

  // Filter items for current active folder (or all items if quick revision)
  const currentFolderItems = isQuickRevision
    ? items
    : items.filter((it) => it.folderName === activeFolder);

  // Group unique subjects in current active folder (for B.Pharm semester view)
  const availableSubjects = isQuickRevision
    ? []
    : Array.from(new Set(currentFolderItems.map((it) => it.subjectName).filter(Boolean)));

  // Filter items to display
  const displayedItems = isQuickRevision
    ? items.filter((it) => {
        if (activeSubject === 'All') return true;
        const itSub = (it.subjectName?.trim() || it.folderName?.trim() || 'General').trim().toLowerCase();
        return itSub === activeSubject.toLowerCase();
      })
    : currentFolderItems.filter((it) => {
        if (activeSubject === 'All') return true;
        return it.subjectName === activeSubject;
      });

  const handleAddToCart = () => {
    if (!pack) return;
    const res = addToCart(pack, 'StudyPack');
    if (res?.added) {
      showToast(`${pack.title} added to cart!`, 'success');
    } else {
      showToast(res?.message || 'Item is already in your cart', 'info');
    }
  };

  const handleBuyNow = () => {
    if (!pack) return;
    addToCart(pack, 'StudyPack');
    navigate('/checkout');
  };

  const handleDownload = (item) => {
    if (!item.pdfUrl) {
      showToast('Please purchase the package to download full notes', 'info');
      return;
    }
    const safeTitle = (item.title || 'Study_Material').replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadPdfToLocal(item.pdfUrl, `${safeTitle}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500">Loading Study Material Package...</p>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Study Material Not Found</h2>
        <p className="text-sm text-slate-500">The requested package does not exist or has been removed.</p>
        <Link
          to="/study-materials"
          className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow"
        >
          ← Back to All Study Materials
        </Link>
      </div>
    );
  }

  const discountPercent =
    pack.price > pack.discountPrice
      ? Math.round(((pack.price - pack.discountPrice) / pack.price) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <SEO
        title={pack?.title}
        description={pack?.description || 'Download comprehensive pharmacy study materials and PDF packages.'}
        path={`/study-materials/${slug}`}
        image={pack?.thumbnail || '/logo.jpg'}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/study-materials" className="hover:text-blue-600 transition">Study Materials</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-bold truncate max-w-xs">{pack.title}</span>
        </div>

        {/* Hero Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-blue-600 text-white font-extrabold text-xs px-3 py-1 rounded-md uppercase tracking-wider">
                  {pack.courseType} {pack.scopeLabel ? `• ${pack.scopeLabel}` : 'Official Pack'}
                </span>
                <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-xs px-2.5 py-1 rounded-md">
                  {pack.validityDays || 365} Days Full Validity
                </span>
                {(isUnlocked || isPurchased) && (
                  <span className="bg-emerald-500 text-white font-extrabold text-xs px-3 py-1 rounded-md flex items-center space-x-1 shadow">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Full Package Active</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                {pack.title}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                {pack.description}
              </p>

              {/* Folder Summary Pills - 3 Sub-Pillars or 2 Pills for Quick Notes */}
              {isQuickRevision ? (
                <div className="grid grid-cols-2 gap-3 pt-2 max-w-md">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                    <span className="text-slate-400 text-[11px] block font-semibold">📁 Subject Modules</span>
                    <span className="font-bold text-sm sm:text-base text-white">{quickSubjects.length || (items.length > 0 ? 1 : 0)} Subjects</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                    <span className="text-slate-400 text-[11px] block font-semibold">📄 PDF Documents</span>
                    <span className="font-bold text-sm sm:text-base text-white">{items.length || pack.totalPdfs || 0} PDF Documents</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                    <span className="text-slate-400 text-[11px] block font-semibold">📁 Folder 1</span>
                    <span className="font-bold text-sm sm:text-base text-white">{folderNames.length || 1} Semesters</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                    <span className="text-slate-400 text-[11px] block font-semibold">📁 Folder 3</span>
                    <span className="font-bold text-sm sm:text-base text-white">{items.length || pack.totalPdfs || 0} PDF Documents</span>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing & CTA Box */}
            <div className="lg:col-span-4 bg-white text-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-baseline space-x-2">
                {pack.isFree ? (
                  <span className="text-3xl font-extrabold text-emerald-600">FREE</span>
                ) : (
                  <>
                    <span className="text-3xl font-extrabold text-slate-900">
                      ₹{pack.discountPrice}
                    </span>
                    {pack.price > pack.discountPrice && (
                      <span className="text-slate-400 line-through text-sm font-semibold">
                        ₹{pack.price}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="text-emerald-600 font-extrabold text-xs bg-emerald-50 px-2 py-0.5 rounded">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </>
                )}
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 py-1">
                {Array.isArray(pack.highlights) && pack.highlights.length > 0 ? (
                  pack.highlights.map((hl, i) => (
                    <p key={i} className="flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{hl}</span>
                    </p>
                  ))
                ) : (
                  <>
                    <p className="flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Comprehensive high-yield PDF notes</span>
                    </p>
                    <p className="flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Downloadable & printable documents</span>
                    </p>
                    <p className="flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Includes all folders with {pack.validityDays || 365}-day access</span>
                    </p>
                  </>
                )}
              </div>

              {isUnlocked || isPurchased ? (
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
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center space-x-2 transition transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Unlock Full Package (₹{pack.discountPrice})</span>
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3-Level Folder Content Explorer */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isQuickRevision ? 'Included Revision Notes' : 'Course Syllabus & Included Notes'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {isQuickRevision
                  ? 'Browse through high-yield revision notes, classification charts, and cheat sheets.'
                  : 'Browse through semesters, subjects, and chapter modules included in this package.'}
              </p>
            </div>

            {/* PDF Count Summary */}
            <div className="bg-slate-100 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 self-start sm:self-auto">
              Total {items.length} PDF Documents
            </div>
          </div>

          {/* Level 1: Subject Tabs (for Quick Notes) OR Folder / Semester Tabs (for B.Pharm) */}
          {items.length > 0 ? (
            <div className="space-y-6">
              {isQuickRevision ? (
                /* Quick Notes: Subject Wise Filter Tabs */
                quickSubjects.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin border-b border-slate-100">
                    <button
                      onClick={() => setActiveSubject('All')}
                      className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
                        activeSubject === 'All'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>All Subjects</span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                          activeSubject === 'All' ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {items.length}
                      </span>
                    </button>

                    {quickSubjects.map((sub) => {
                      const isActive = activeSubject.toLowerCase() === sub.key;
                      return (
                        <button
                          key={sub.key}
                          onClick={() => setActiveSubject(sub.name)}
                          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Layers className="w-4 h-4" />
                          <span>{sub.name}</span>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                              isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {sub.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                /* B.Pharm / Standard Semester-Wise Packages */
                folderNames.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin border-b border-slate-100">
                    {folderNames.map((folder) => {
                      const count = items.filter((it) => it.folderName === folder).length;
                      const isActive = activeFolder === folder;
                      return (
                        <button
                          key={folder}
                          onClick={() => {
                            setActiveFolder(folder);
                            setActiveSubject('All');
                          }}
                          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Layers className="w-4 h-4" />
                          <span>{folder}</span>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                              isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )
              )}

              {/* Level 2: Subject Pill Selector (if available in B.Pharm) */}
              {!isQuickRevision && availableSubjects.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pr-2">
                    Filter Subject:
                  </span>
                  <button
                    onClick={() => setActiveSubject('All')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeSubject === 'All'
                        ? 'bg-slate-900 text-white shadow'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Subjects ({currentFolderItems.length})
                  </button>
                  {availableSubjects.map((sub) => {
                    const subCount = currentFolderItems.filter((it) => it.subjectName === sub).length;
                    const isActive = activeSubject === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => setActiveSubject(sub)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {sub} ({subCount})
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Level 3: PDF Document Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedItems.map((item) => {
                  const itemAvailable = isUnlocked || item.isFreeDemo;
                  const itemSubject = (item.subjectName || (isQuickRevision ? item.folderName : '') || '').trim();

                  return (
                    <div
                      key={item._id}
                      className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
                        itemAvailable
                          ? 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                          : 'bg-slate-50/70 border-slate-200/60'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Tags / Sub-labels */}
                        <div className="flex flex-wrap items-center gap-2">
                          {itemSubject && (
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                              {itemSubject}
                            </span>
                          )}
                          {item.chapterName && (
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                              {item.chapterName}
                            </span>
                          )}
                          {item.pageCount > 0 && (
                            <span className="text-[11px] font-medium text-slate-400">
                              • {item.pageCount} Pages
                            </span>
                          )}
                          {item.isFreeDemo && (
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider ml-auto">
                              🟢 Free Demo
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                          {item.title}
                        </h4>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        {itemAvailable ? (
                          <div className="flex items-center space-x-2 w-full">
                            <button
                              onClick={() =>
                                setPreviewModal({
                                  isOpen: true,
                                  pdfUrl: item.pdfUrl,
                                  title: item.title,
                                })
                              }
                              className="flex-1 py-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview PDF</span>
                            </button>

                            <button
                              onClick={() => handleDownload(item)}
                              className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Locked Document</span>
                            </span>

                            <button
                              onClick={handleBuyNow}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow transition cursor-pointer"
                            >
                              Unlock Pack ₹{pack.discountPrice}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              No notes uploaded in this package yet.
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer In-App Modal */}
      <PdfViewerModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, pdfUrl: '', title: '' })}
        pdfUrl={previewModal.pdfUrl}
        title={previewModal.title}
      />
    </div>
  );
};

export default StudyPackDetail;
