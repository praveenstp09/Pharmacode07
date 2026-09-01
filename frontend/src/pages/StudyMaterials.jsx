import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Download,
  Eye,
  Search,
  ChevronRight,
  Sparkles,
  Layers,
  FolderOpen,
  Lock,
  ShoppingCart,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import PdfViewerModal from '../components/common/PdfViewerModal';
import { downloadPdfToLocal } from '../utils/downloadHelper';
import CardSkeleton from '../components/common/SkeletonCard';

// Standard Quick Revision Subjects for Pharmacist Competitive Exams
export const QUICK_REVISION_SUBJECTS = [
  'Pharmacology & Toxicology',
  'Pharmaceutics & Formulation',
  'Pharmaceutical Chemistry & Analysis',
  'Pharmacognosy & Phytochemistry',
  'Human Anatomy & Physiology (HAP)',
  'Biochemistry & Clinical Pathology',
  'Hospital & Clinical Pharmacy',
  'Pharmaceutical Jurisprudence & Ethics',
  'Community Pharmacy & Management',
  'Microbiology & Biotechnology',
];

// PCI Syllabus Standard Subjects by Semester
export const PCI_CURRICULUM = {
  'B.Pharm': {
    'Semester 1': [
      'Human Anatomy and Physiology I',
      'Pharmaceutical Analysis I',
      'Pharmaceutics I',
      'Pharmaceutical Inorganic Chemistry',
      'Communication Skills',
      'Remedial Biology / Mathematics',
    ],
    'Semester 2': [
      'Human Anatomy and Physiology II',
      'Pharmaceutical Organic Chemistry I',
      'Biochemistry',
      'Pathophysiology',
      'Computer Applications in Pharmacy',
      'Environmental Sciences',
    ],
    'Semester 3': [
      'Pharmaceutical Organic Chemistry II',
      'Physical Pharmaceutics I',
      'Pharmaceutical Microbiology',
      'Pharmaceutical Engineering',
    ],
    'Semester 4': [
      'Pharmaceutical Organic Chemistry III',
      'Medicinal Chemistry I',
      'Physical Pharmaceutics II',
      'Pharmacology I',
      'Pharmacognosy and Phytochemistry I',
    ],
    'Semester 5': [
      'Medicinal Chemistry II',
      'Industrial Pharmacy I',
      'Pharmacology II',
      'Pharmacognosy and Phytochemistry II',
      'Pharmaceutical Jurisprudence',
    ],
    'Semester 6': [
      'Medicinal Chemistry III',
      'Pharmacology III',
      'Herbal Drug Technology',
      'Biopharmaceutics and Pharmacokinetics',
      'Pharmaceutical Biotechnology',
      'Quality Assurance',
    ],
    'Semester 7': [
      'Instrumental Methods of Analysis',
      'Industrial Pharmacy II',
      'Pharmacy Practice',
      'Novel Drug Delivery System (NDDS)',
    ],
    'Semester 8': [
      'Biostatistics and Research Methodology',
      'Social and Preventive Pharmacy',
      'Pharma Marketing Management',
      'Pharmaceutical Regulatory Science',
      'Pharmacovigilance',
    ],
  },
  'D.Pharm': {
    '1st Year': [
      'Pharmaceutics',
      'Pharmaceutical Chemistry',
      'Pharmacognosy',
      'Human Anatomy and Physiology',
      'Social Pharmacy',
    ],
    '2nd Year': [
      'Pharmacology',
      'Community Pharmacy and Management',
      'Biochemistry and Clinical Pathology',
      'Pharmacotherapeutics',
      'Hospital and Clinical Pharmacy',
      'Pharmacy Law and Ethics',
    ],
  },
  'QuickRevision': {
    'All Subjects': QUICK_REVISION_SUBJECTS,
  },
};

const StudyMaterials = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = (item) => {
    const res = addToCart(item, 'StudyMaterial');
    if (res?.added) {
      showToast(`${item.title} added to cart!`, 'success');
    } else {
      showToast(res?.message || 'Item is already in cart', 'info');
    }
  };

  const [activeCourse, setActiveCourse] = useState('B.Pharm'); // 'B.Pharm', 'D.Pharm', 'QuickRevision'
  const [selectedSemOrYear, setSelectedSemOrYear] = useState('Semester 1');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all', 'chapter_notes', 'pyq_paper'
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [previewPdf, setPreviewPdf] = useState({ isOpen: false, url: '', title: '', id: null });

  const bPharmSemesters = [
    'Semester 1',
    'Semester 2',
    'Semester 3',
    'Semester 4',
    'Semester 5',
    'Semester 6',
    'Semester 7',
    'Semester 8',
  ];

  const dPharmYears = ['1st Year', '2nd Year'];

  useEffect(() => {
    if (activeCourse === 'B.Pharm') {
      setSelectedSemOrYear('Semester 1');
    } else if (activeCourse === 'D.Pharm') {
      setSelectedSemOrYear('1st Year');
    } else {
      setSelectedSemOrYear('All Subjects');
    }
    setSelectedSubject('All');
  }, [activeCourse]);

  useEffect(() => {
    fetchMaterials();
  }, [activeCourse, selectedSemOrYear, selectedSubject, activeSubTab]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let url = `/materials?courseType=${activeCourse}`;
      if (selectedSemOrYear !== 'All' && selectedSemOrYear !== 'All Subjects') {
        url += `&semesterOrYear=${encodeURIComponent(selectedSemOrYear)}`;
      }
      if (selectedSubject !== 'All') {
        url += `&subject=${encodeURIComponent(selectedSubject)}`;
      }
      if (activeSubTab !== 'all') {
        url += `&materialType=${activeSubTab}`;
      }
      const res = await api.get(url);
      if (res.data.success) {
        setMaterials(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load study materials:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get subjects list for current course + semester/year
  let standardSubjects = [];
  if (activeCourse === 'QuickRevision') {
    standardSubjects = QUICK_REVISION_SUBJECTS;
  } else {
    standardSubjects = PCI_CURRICULUM[activeCourse]?.[selectedSemOrYear] || [];
  }

  // Merge with any custom subjects present in the returned materials
  const dynamicSubjects = [
    ...new Set([...standardSubjects, ...materials.map(m => m.subject).filter(Boolean)]),
  ];

  const filtered = materials.filter(
    m =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      (m.chapter && m.chapter.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb Trail */}
      <div className="flex flex-wrap items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-bold">Study Materials</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-blue-600 font-bold">
          {activeCourse === 'QuickRevision' ? 'Quick Revision Notes' : activeCourse}
        </span>
        {selectedSemOrYear !== 'All' && selectedSemOrYear !== 'All Subjects' && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">{selectedSemOrYear}</span>
          </>
        )}
        {selectedSubject !== 'All' && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-indigo-600 font-bold">{selectedSubject}</span>
          </>
        )}
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-blue-200 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Pillar 2: Pharmacy Study & Revision Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Curriculum Notes, PYQs & Quick Revision
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Standard PCI-aligned chapter notes for B.Pharm & D.Pharm, plus high-yield Quick Revision PDF sheets for all Pharmacist examinations.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search topic, chapter, subject..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-2xl text-xs sm:text-sm text-white placeholder:text-blue-200/60 focus:bg-white focus:text-slate-900 focus:outline-none transition shadow-inner font-medium"
          />
        </div>
      </div>

      {/* LEVEL 1: Category Pillars (B.Pharm vs D.Pharm vs Quick Revision Notes) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            id: 'B.Pharm',
            title: '🎓 B.Pharm Notes & PYQs',
            sub: 'Semesters 1 to 8 • PCI Curriculum',
          },
          {
            id: 'D.Pharm',
            title: '💊 Diploma (D.Pharm)',
            sub: '1st & 2nd Year • ER-2020 Syllabus',
          },
          {
            id: 'QuickRevision',
            title: '⚡ Quick Revision Notes',
            sub: 'All Subjects • High-Yield Pharmacist PDF Sheets',
          },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCourse(tab.id)}
            className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
              activeCourse === tab.id
                ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-600/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <span
              className={`font-extrabold text-sm sm:text-base ${
                activeCourse === tab.id ? 'text-blue-700' : 'text-slate-800'
              }`}
            >
              {tab.title}
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-1">{tab.sub}</span>
          </button>
        ))}
      </div>

      {/* LEVEL 2: Semester / Year / Quick Revision Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>
              {activeCourse === 'B.Pharm' && 'Select Semester (PCI Scheme)'}
              {activeCourse === 'D.Pharm' && 'Select Diploma Year (ER-2020)'}
              {activeCourse === 'QuickRevision' && 'Pharmacist Exam Quick Revision PDF Notes'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {/* B.PHARM SEMESTERS */}
          {activeCourse === 'B.Pharm' &&
            bPharmSemesters.map(sem => (
              <button
                key={sem}
                onClick={() => setSelectedSemOrYear(sem)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                  selectedSemOrYear === sem
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sem}
              </button>
            ))}

          {/* D.PHARM YEARS */}
          {activeCourse === 'D.Pharm' &&
            dPharmYears.map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedSemOrYear(yr)}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                  selectedSemOrYear === yr
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}

          {/* QUICK REVISION PILL */}
          {activeCourse === 'QuickRevision' && (
            <div className="px-4 py-2 rounded-xl text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
              ⚡ High-Yield Formula & Drug Summaries for All State & Central Pharmacist Exams
            </div>
          )}
        </div>
      </div>

      {/* LEVEL 3: Subjects Selector */}
      {dynamicSubjects.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center space-x-1.5">
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span>
                {activeCourse === 'QuickRevision'
                  ? 'Filter by Subject'
                  : `Choose Subject in ${selectedSemOrYear}`}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedSubject('All')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                selectedSubject === 'All'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Subjects
            </button>
            {dynamicSubjects.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                  selectedSubject === sub
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LEVEL 4: Materials Explorer */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* Sub-tabs: All vs Chapter Notes vs PYQ Papers */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'all'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Documents
            </button>
            <button
              onClick={() => setActiveSubTab('chapter_notes')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'chapter_notes'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📄 Chapter / Revision Notes
            </button>
            {activeCourse !== 'QuickRevision' && (
              <button
                onClick={() => setActiveSubTab('pyq_paper')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeSubTab === 'pyq_paper'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📑 PYQ Question Papers
              </button>
            )}
          </div>

          <span className="text-xs text-slate-500 font-bold">
            Showing {filtered.length} PDF documents
          </span>
        </div>

        {/* Content List / Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <CardSkeleton key={idx} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
              📚
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              COMING SOON 
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              New PDF notes and PYQs for this category will be uploaded shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(item => (
              <div
                key={item._id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase bg-blue-50 text-blue-700">
                      {item.subject}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.materialType === 'chapter_notes' ? 'Notes PDF' : 'PYQ Paper'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                    {item.title}
                  </h3>

                  {item.chapter && (
                    <p className="text-xs text-slate-500 font-semibold">🔖 {item.chapter}</p>
                  )}
                  <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
                  <span className="text-xs text-emerald-600 font-extrabold">
                    {item.isPaid
                      ? ((user?.purchasedMaterials || []).some(
                          id => (id?._id || id)?.toString() === item._id?.toString()
                        ) || user?.role === 'admin'
                          ? '✓ Enrolled'
                          : `₹${item.price}`)
                      : 'Free Access'}
                  </span>

                  <div className="flex items-center space-x-2">
                    {!item.isPaid ||
                    user?.role === 'admin' ||
                    (user?.purchasedMaterials || []).some(
                      id => (id?._id || id)?.toString() === item._id?.toString()
                    ) ? (
                      <>
                        <button
                          onClick={() =>
                            setPreviewPdf({
                              isOpen: true,
                              url: item.fileUrl,
                              title: item.title,
                              id: item._id,
                            })
                          }
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => {
                            if (item._id) {
                              api.post(`/materials/${item._id}/track-download`).catch(() => {});
                            }
                            const safeName = (item.title || 'Pharmacode07_Notes').replace(/[^a-zA-Z0-9_-]/g, '_');
                            downloadPdfToLocal(item.fileUrl, `${safeName}.pdf`);
                          }}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1 transition shadow cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="p-2 border border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-700 rounded-xl transition cursor-pointer"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            addToCart(item, 'StudyMaterial');
                            navigate('/checkout');
                          }}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1 transition shadow cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Buy Now (₹{item.price})</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Modal Viewer */}
      <PdfViewerModal
        isOpen={previewPdf.isOpen}
        onClose={() => setPreviewPdf({ isOpen: false, url: '', title: '', id: null })}
        pdfUrl={previewPdf.url}
        title={previewPdf.title}
        materialId={previewPdf.id}
      />
    </div>
  );
};

export default StudyMaterials;
