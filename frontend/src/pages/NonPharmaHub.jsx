import React, { useState, useEffect } from 'react';
import {
  Brain,
  Calculator,
  Newspaper,
  Landmark,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import PdfViewerModal from '../components/common/PdfViewerModal';
import HeroBanner from '../components/common/HeroBanner';
import SearchInput from '../components/common/SearchInput';
import NonPharmaCard from '../components/common/cards/NonPharmaCard';
import SEO from '../components/common/SEO';

const NonPharmaHub = () => {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState('reasoning');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [previewPdf, setPreviewPdf] = useState({ isOpen: false, url: '', title: '' });

  const sections = [
    { id: 'reasoning', label: 'Reasoning & Logic', icon: Brain },
    { id: 'maths', label: 'Numerical Ability', icon: Calculator },
    { id: 'current_affairs', label: 'Monthly Current Affairs', icon: Newspaper },
    { id: 'general_studies_gk', label: 'General Studies & GK', icon: Landmark },
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
      console.error('Failed to load non-pharma resources', err);
      showToast('Unable to load non-pharma resources. Please check your internet connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = resources.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.topic && r.topic.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <SEO
        title="Non-Pharma Exam Preparation Hub"
        description="Reasoning, Maths, Monthly Current Affairs, and General Studies / GK for GSSSB, ESIC, AIIMS, and state pharmacist competitive exams."
        path="/non-pharma"
      />
      {/* Banner */}
      <HeroBanner
        pill="Pillar 4: General Aptitude & Awareness"
        title="Non-Pharma Exam Preparation Hub"
        subtitle="Master the general section of ESIC, AIIMS, GSSSB, OSSSC, UPSSSC and state pharmacist exams: Reasoning, Quantitative Aptitude, Monthly Current Affairs, and General Studies."
      />

      {/* 4 Section Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`p-3.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center space-x-2.5 transition cursor-pointer ${
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
              {sections.find((s) => s.id === activeSection)?.label} Practice
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Attempt interactive CBT practice tests or read summary revision PDFs.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search topics..."
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
            {filtered.map((item) => (
              <NonPharmaCard
                key={item._id}
                item={item}
                variant="marketplace"
                onPreviewPdf={(doc) =>
                  setPreviewPdf({
                    isOpen: true,
                    url: doc.pdfUrl || '',
                    title: doc.title,
                  })
                }
              />
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
