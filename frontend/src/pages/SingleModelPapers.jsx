import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Clock,
  Play,
  Download,
  Eye,
  CheckCircle2,
  Lock,
  Search,
  Filter,
  Sparkles,
  Zap,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import PdfViewerModal from '../components/common/PdfViewerModal';
import { downloadPdfToLocal } from '../utils/downloadHelper';

const SingleModelPapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState('All');
  const [search, setSearch] = useState('');
  const [previewPdf, setPreviewPdf] = useState({ isOpen: false, url: '', title: '' });

  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const exams = ['All', 'AIIMS', 'GSSSB', 'ESIC', 'BFUHS', 'OSSSC', 'UPSSSC', 'MP', 'Bihar'];

  useEffect(() => {
    fetchPapers();
  }, [selectedExam]);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      let url = '/single-models';
      if (selectedExam !== 'All') url += `?examType=${selectedExam}`;
      const res = await api.get(url);
      if (res.data.success) {
        setPapers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load single model papers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = papers.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.examType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold text-blue-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pillar 3: A-La-Carte Model Papers</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Single Model Papers (CBT & PDF)
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Practice individual full-length model papers with authentic exam patterns, timer, negative marking, and downloadable answer keys without purchasing full test series packs.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Exam Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
          {exams.map(exam => (
            <button
              key={exam}
              onClick={() => setSelectedExam(exam)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
                selectedExam === exam
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {exam}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search model papers..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Model Papers Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading model papers...</p>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Model Papers Found</h3>
          <p className="text-xs text-slate-500">Try selecting another exam category or clearing your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map(paper => (
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
                  ) : (
                    <span className="text-xs font-extrabold text-slate-900">
                      ₹{paper.discountPrice || paper.price}
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

              <div className="space-y-2 pt-3 border-t border-slate-100">
                {paper.hasCBT && (
                  <Link
                    to={paper.testPaperId ? `/attempt/${paper.testPaperId._id || paper.testPaperId}` : '#'}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{paper.isFree ? 'Start Free CBT Test' : 'Take Online CBT Exam'}</span>
                  </Link>
                )}

                {paper.hasPdf && paper.pdfUrl && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        setPreviewPdf({
                          isOpen: true,
                          url: paper.pdfUrl,
                          title: paper.title,
                        })
                      }
                      className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => {
                        const safeName = (paper.title || 'Pharmacode07_ModelPaper').replace(/[^a-zA-Z0-9_-]/g, '_');
                        downloadPdfToLocal(paper.pdfUrl, `${safeName}.pdf`);
                      }}
                      className="py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Modal Viewer */}
      <PdfViewerModal
        isOpen={previewPdf.isOpen}
        onClose={() => setPreviewPdf({ isOpen: false, url: '', title: '' })}
        pdfUrl={previewPdf.url}
        title={previewPdf.title}
      />
    </div>
  );
};

export default SingleModelPapers;
