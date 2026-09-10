import React, { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import HeroBanner from '../components/common/HeroBanner';
import FilterPills from '../components/common/FilterPills';
import EmptyState from '../components/common/EmptyState';
import SEO from '../components/common/SEO';

const PYQs = () => {
  const { showToast } = useToast();
  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState('All');

  const exams = ['All', 'GSSSB', 'UPSSSC', 'RRB', 'AIIMS', 'GPAT'];

  useEffect(() => {
    fetchPYQs();
  }, [selectedExam]);

  const fetchPYQs = async () => {
    setLoading(true);
    try {
      let query = `?category=PYQ`;
      if (selectedExam !== 'All') query += `&examType=${selectedExam}`;

      const res = await api.get(`/materials${query}`);
      if (res.data.success) {
        setPyqs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load PYQs', err);
      showToast('Unable to load previous year question papers. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <SEO
        title="Pharmacist Previous Year Question Papers (PYQs)"
        description="Download genuine past pharmacist exam papers (2020–2025) for GSSSB, UPSSSC, RRB, AIIMS, and GPAT with complete answer keys."
        path="/pyqs"
      />
      <HeroBanner
        pill="Official Solved Papers"
        title="Pharmacist Previous Year Question Papers (PYQs)"
        subtitle="Download genuine past exam papers (2020–2025) with detailed answer keys and explanations."
      >
        <div className="pt-2">
          <FilterPills
            items={exams}
            activeItem={selectedExam}
            onSelect={setSelectedExam}
          />
        </div>
      </HeroBanner>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 font-semibold text-sm">Loading solved papers...</p>
        </div>
      ) : pyqs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No PYQ papers found"
          subtitle='Check back later or select "All" from exam tabs.'
          actionText="View All Exams"
          onAction={() => setSelectedExam('All')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pyqs.map((paper) => (
            <div
              key={paper._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-blue-300 transition flex items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  PDF
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {paper.examType} {paper.year || 2024}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {paper.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{paper.description}</p>
                </div>
              </div>

              <a
                href={paper.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PYQs;
