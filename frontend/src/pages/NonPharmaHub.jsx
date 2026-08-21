import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Calculator,
  Newspaper,
  Landmark,
  Play,
  Download,
  Eye,
  FileText,
  Search,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import PdfViewerModal from '../components/common/PdfViewerModal';
import { downloadPdfToLocal } from '../utils/downloadHelper';

const NonPharmaHub = () => {
  const [activeSection, setActiveSection] = useState('reasoning'); // 'reasoning', 'maths', 'current_affairs', 'general_studies_gk'
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [previewPdf, setPreviewPdf] = useState({ isOpen: false, url: '', title: '' });

  const sections = [
    { id: 'reasoning', label: 'Reasoning Ability', icon: Brain, color: 'text-blue-600 bg-blue-50' },
    { id: 'maths', label: 'Quantitative Aptitude', icon: Calculator, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'current_affairs', label: 'Current Affairs', icon: Newspaper, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'general_studies_gk', label: 'General Studies & GK', icon: Landmark, color: 'text-amber-600 bg-amber-50' },
  ];

  useEffect(() => {
    fetchResources();
  }, [activeSection]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/non-pharma?section=${activeSection}`);
      if (res.data.success) {
        setResources(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load non-pharma resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.topic && r.topic.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pillar 4: General Aptitude & Awareness</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Non-Pharma Exam Preparation Hub
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Master the general section of ESIC, AIIMS, GSSSB, OSSSC, UPSSSC and state pharmacist exams: Reasoning, Quantitative Aptitude, Monthly Current Affairs, and General Studies.
          </p>
        </div>
      </div>

      {/* 4 Section Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        {sections.map(sec => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`p-3.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center space-x-2.5 transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span className="truncate">{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 capitalize">
              {sections.find(s => s.id === activeSection)?.label} Practice
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Attempt interactive CBT practice tests or read summary revision PDFs.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search topics..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="min-h-[30vh] flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading resources...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Brain className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No resources found in this section</p>
            <p className="text-xs text-slate-400">Check back soon for new quizzes and PDFs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(item => (
              <div
                key={item._id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase bg-indigo-50 text-indigo-700">
                      {item.contentType === 'cbt' ? 'CBT Quiz' : 'PDF Capsule'}
                    </span>
                    {item.relevanceMonth && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        📅 {item.relevanceMonth}
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                    {item.title}
                  </h3>
                  {item.topic && (
                    <p className="text-xs text-slate-500">Topic: {item.topic}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
                  <span className="text-xs text-slate-500 font-semibold">
                    {item.contentType === 'cbt' ? `⏱️ ${item.durationMinutes || 30} Mins` : '📄 PDF Notes'}
                  </span>

                  <div className="flex items-center space-x-2">
                    {item.contentType === 'cbt' ? (
                      <Link
                        to={item.testPaperId ? `/attempt/${item.testPaperId._id || item.testPaperId}` : '#'}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5 transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start Test</span>
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            setPreviewPdf({
                              isOpen: true,
                              url: item.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                              title: item.title,
                            })
                          }
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => {
                            const safeName = (item.title || 'Pharmacode07_Aptitude').replace(/[^a-zA-Z0-9_-]/g, '_');
                            downloadPdfToLocal(item.pdfUrl, `${safeName}.pdf`);
                          }}
                          className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
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
        onClose={() => setPreviewPdf({ isOpen: false, url: '', title: '' })}
        pdfUrl={previewPdf.url}
        title={previewPdf.title}
      />
    </div>
  );
};

export default NonPharmaHub;
