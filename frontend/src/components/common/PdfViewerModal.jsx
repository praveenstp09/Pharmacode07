import React, { useState } from 'react';
import { X, Download, ExternalLink, FileText, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { downloadPdfToLocal } from '../../utils/downloadHelper';

const PdfViewerModal = ({ isOpen, onClose, pdfUrl, title, materialId }) => {
  const [useDirectView, setUseDirectView] = useState(false);

  if (!isOpen || !pdfUrl) return null;

  const handleDownload = async () => {
    if (materialId) {
      try {
        await api.post(`/materials/${materialId}/track-download`);
      } catch (e) {}
    }
    const safeTitle = (title || 'Pharmacode07_Document').replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadPdfToLocal(pdfUrl, `${safeTitle}.pdf`);
  };

  // Google Docs viewer vs Direct iframe viewer
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
  const activeViewerUrl = useDirectView ? pdfUrl : googleViewerUrl;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                {title || 'Document Viewer'}
              </h3>
              <p className="text-xs text-slate-500">PharmaCode07 PDF Document Reader</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setUseDirectView(!useDirectView)}
              className="text-[11px] font-bold text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition hidden sm:inline"
            >
              {useDirectView ? 'Switch to Google Viewer' : 'Switch to Direct Viewer'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
              title="Download to Local Machine"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-100 relative">
          <iframe
            src={activeViewerUrl}
            title={title}
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
