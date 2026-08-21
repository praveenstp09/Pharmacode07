import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  FileText,
  Download,
  Eye,
  Search,
  ChevronRight,
  Sparkles,
  Layers,
  FolderOpen,
} from 'lucide-react';
import api from '../services/api';
import PdfViewerModal from '../components/common/PdfViewerModal';
import { downloadPdfToLocal } from '../utils/downloadHelper';

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
};

const StudyMaterials = () => {
  const [activeCourse, setActiveCourse] = useState('B.Pharm'); // 'B.Pharm', 'D.Pharm', 'Exam'
  const [selectedSemOrYear, setSelectedSemOrYear] = useState('Semester 1');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all', 'chapter_notes', 'pyq_paper'
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [previewPdf, setPreviewPdf] = useState({ isOpen: false, url: '', title: '', id: null });
  const [availableExams, setAvailableExams] = useState([
    'All',
    'GSSSB Pharmacist',
    'AIIMS Pharmacist',
    'ESIC Pharmacist',
    'BFUHS Pharmacist',
    'OSSSC Pharmacist',
    'UPSSSC Pharmacist',
    'MP Vyapam Pharmacist',
    'Bihar BTSC Pharmacist',
  ]);

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
      setSelectedSemOrYear('All');
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
      if (selectedSemOrYear !== 'All') url += `&semesterOrYear=${encodeURIComponent(selectedSemOrYear)}`;
      if (selectedSubject !== 'All') url += `&subject=${encodeURIComponent(selectedSubject)}`;
      if (activeSubTab !== 'all') url += `&materialType=${activeSubTab}`;
      const res = await api.get(url);
      if (res.data.success) {
        setMaterials(res.data.data);

        // Dynamically collect any new custom exam names from DB
        if (activeCourse === 'Exam') {
          const distinctExams = [
            'All',
            ...new Set(res.data.data.map(m => m.semesterOrYear).filter(Boolean)),
          ];
          setAvailableExams(prev => [...new Set([...prev, ...distinctExams])]);
        }
      }
    } catch (err) {
      console.error('Failed to load study materials:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get subjects list for current course + semester/year
  const standardSubjects =
    PCI_CURRICULUM[activeCourse]?.[selectedSemOrYear] || [];

  // Merge with any custom subjects present in the returned materials
  const dynamicSubjects = [
    ...new Set([...standardSubjects, ...materials.map(m => m.subject).filter(Boolean)]),
  ];

  const filtered = materials.filter(m =>
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
        <span className="text-blue-600 font-bold">{activeCourse}</span>
        {selectedSemOrYear !== 'All' && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-indigo-600 font-bold">{selectedSemOrYear}</span>
          </>
        )}
        {selectedSubject !== 'All' && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 font-extrabold">{selectedSubject}</span>
          </>
        )}
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold text-blue-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pillar 2: Semester Notes & University PYQs Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Pharmacy Notes & Solved Papers Library
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Select Course ➔ Choose Semester / Year ➔ Select Subject ➔ Download or Preview Chapter-Wise Notes and University PYQ Papers.
          </p>
        </div>
      </div>

      {/* LEVEL 1: Course Level Switcher */}
      <div className="grid grid-cols-3 gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveCourse('B.Pharm')}
          className={`py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
            activeCourse === 'B.Pharm'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>🎓 B.Pharm (8 Semesters)</span>
        </button>

        <button
          onClick={() => setActiveCourse('D.Pharm')}
          className={`py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
            activeCourse === 'D.Pharm'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>🎓 Diploma (1st & 2nd Year)</span>
        </button>

        <button
          onClick={() => setActiveCourse('Exam')}
          className={`py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
            activeCourse === 'Exam'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>🎯 State Exam Notes</span>
        </button>
      </div>

      {/* LEVEL 2: Semester / Year / Target Exam Selector */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          {activeCourse === 'B.Pharm'
            ? 'Step 1: Select B.Pharm Semester'
            : activeCourse === 'D.Pharm'
            ? 'Step 1: Select Diploma Year'
            : 'Step 1: Select Target Exam'}
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {activeCourse === 'B.Pharm' &&
            bPharmSemesters.map(sem => (
              <button
                key={sem}
                onClick={() => {
                  setSelectedSemOrYear(sem);
                  setSelectedSubject('All');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                  selectedSemOrYear === sem
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {sem}
              </button>
            ))}

          {activeCourse === 'D.Pharm' &&
            dPharmYears.map(yr => (
              <button
                key={yr}
                onClick={() => {
                  setSelectedSemOrYear(yr);
                  setSelectedSubject('All');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                  selectedSemOrYear === yr
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}

          {activeCourse === 'Exam' &&
            availableExams.map(ex => (
              <button
                key={ex}
                onClick={() => {
                  setSelectedSemOrYear(ex);
                  setSelectedSubject('All');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                  selectedSemOrYear === ex
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {ex}
              </button>
            ))}
        </div>
      </div>

      {/* LEVEL 3: Subjects Selector (Semester ➔ Subjects) */}
      {dynamicSubjects.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center space-x-1.5">
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span>Step 2: Choose Subject in {selectedSemOrYear}</span>
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

      {/* LEVEL 4: Materials Explorer (Chapter Notes vs PYQ Papers) */}
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
              All Content
            </button>
            <button
              onClick={() => setActiveSubTab('chapter_notes')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'chapter_notes'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📄 Chapter-Wise Notes
            </button>
            <button
              onClick={() => setActiveSubTab('pyq_paper')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'pyq_paper'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📑 University/Board PYQs
            </button>
          </div>

          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chapters or keywords..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Results List */}
        {loading ? (
          <div className="min-h-[30vh] flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading documents...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No notes found for this subject/semester</p>
            <p className="text-xs text-slate-400">
              Admin is updating notes for {selectedSubject !== 'All' ? selectedSubject : selectedSemOrYear}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(item => (
              <div
                key={item._id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase bg-blue-50 text-blue-700">
                      {item.subject}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.materialType === 'chapter_notes' ? 'Chapter Notes' : 'PYQ Paper'}
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
                    {item.isPaid ? `₹${item.price}` : 'Free Access'}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setPreviewPdf({
                          isOpen: true,
                          url: item.fileUrl,
                          title: item.title,
                          id: item._id,
                        })
                      }
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition"
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
