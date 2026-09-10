import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Download, Eye } from 'lucide-react';
import { downloadPdfToLocal } from '../../../utils/downloadHelper';

const NonPharmaCard = ({
  item,
  variant = 'marketplace', // 'marketplace' | 'dashboard'
  onPreviewPdf,
}) => {
  if (!item) return null;

  const testPaperId = item.testPaperId?._id || item.testPaperId;

  // 1. Dashboard Enrolled Variant
  if (variant === 'dashboard') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700">
              {item.section}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
              ✓ Enrolled
            </span>
          </div>

          <h4 className="font-bold text-slate-900 text-base leading-snug">{item.title}</h4>
          {item.topic && (
            <p className="text-xs text-slate-500 font-medium">Topic: {item.topic}</p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100">
          {item.contentType === 'cbt' && testPaperId ? (
            <Link
              to={`/attempt/${testPaperId}`}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start CBT Drill</span>
            </Link>
          ) : item.pdfUrl ? (
            <button
              type="button"
              onClick={() => {
                const safeName = (item.title || 'Pharmacode_Aptitude').replace(/[^a-zA-Z0-9_-]/g, '_');
                downloadPdfToLocal(item.pdfUrl, `${safeName}.pdf`);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Notes</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-semibold block text-center">
              Resource Ready
            </span>
          )}
        </div>
      </div>
    );
  }

  // 2. Marketplace Variant
  return (
    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition flex flex-col justify-between space-y-4">
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
              to={testPaperId ? `/attempt/${testPaperId}` : '#'}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Test</span>
            </Link>
          ) : (
            <>
              {onPreviewPdf && (
                <button
                  type="button"
                  onClick={() => onPreviewPdf(item)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              )}
              <button
                type="button"
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
  );
};

export default NonPharmaCard;
