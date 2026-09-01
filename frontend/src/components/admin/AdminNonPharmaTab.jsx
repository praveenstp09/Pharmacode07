import React, { useState } from 'react';
import { Search, Edit3, Trash2 } from 'lucide-react';
import api from '../../services/api';
import BulkQuestionParser from './BulkQuestionParser';

const ITEMS_PER_PAGE = 8;

const AdminNonPharmaTab = ({
  nonPharmaList,
  fetchAdminData,
  setEditModal,
  showToast,
  handleFileUpload,
  uploadingFile,
}) => {
  const [newNonPharma, setNewNonPharma] = useState({
    title: '',
    section: 'reasoning',
    topic: '',
    contentType: 'cbt',
    pdfUrl: '',
    relevanceMonth: 'August 2026',
    isFree: true,
    price: 0,
    durationMinutes: 30,
  });
  const [nonPharmaQuestions, setNonPharmaQuestions] = useState([]);

  const [nonPharmaSearch, setNonPharmaSearch] = useState('');
  const [nonPharmaPage, setNonPharmaPage] = useState(1);

  const handleCreateNonPharma = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/non-pharma', {
        ...newNonPharma,
        questions: newNonPharma.contentType === 'cbt' ? nonPharmaQuestions : [],
      });
      if (res.data.success) {
        showToast('Non-Pharma Resource created successfully!', 'success');
        setNonPharmaQuestions([]);
        setNewNonPharma({
          title: '',
          section: 'reasoning',
          topic: '',
          contentType: 'cbt',
          pdfUrl: '',
          relevanceMonth: 'August 2026',
          isFree: true,
          price: 0,
          durationMinutes: 30,
        });
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDeleteNonPharma = async id => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      const res = await api.delete(`/non-pharma/${id}`);
      if (res.data.success) {
        showToast('Resource deleted successfully', 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to delete: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const filteredNonPharma = nonPharmaList.filter(np =>
    !nonPharmaSearch ||
    np.title?.toLowerCase().includes(nonPharmaSearch.toLowerCase()) ||
    np.section?.toLowerCase().includes(nonPharmaSearch.toLowerCase()) ||
    np.topic?.toLowerCase().includes(nonPharmaSearch.toLowerCase())
  );
  const paginatedNonPharma = filteredNonPharma.slice((nonPharmaPage - 1) * ITEMS_PER_PAGE, nonPharmaPage * ITEMS_PER_PAGE);
  const totalNonPharmaPages = Math.ceil(filteredNonPharma.length / ITEMS_PER_PAGE) || 1;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <h3 className="font-extrabold text-slate-900 text-lg">
        Non-Pharma Aptitude & GK Studio
      </h3>

      <form onSubmit={handleCreateNonPharma} className="space-y-4 text-xs sm:text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-bold text-slate-700">Section</label>
            <select
              value={newNonPharma.section}
              onChange={e => setNewNonPharma({ ...newNonPharma, section: e.target.value })}
              className="w-full mt-1 p-2.5 border rounded-xl font-bold"
            >
              <option value="reasoning">🧠 Reasoning</option>
              <option value="maths">📐 Quantitative Aptitude</option>
              <option value="current_affairs">📰 Current Affairs</option>
              <option value="general_studies_gk">🏛️ General Studies & GK</option>
            </select>
          </div>
          <div>
            <label className="font-bold text-slate-700">Topic</label>
            <input
              type="text"
              value={newNonPharma.topic}
              onChange={e => setNewNonPharma({ ...newNonPharma, topic: e.target.value })}
              placeholder="e.g. Blood Relations or Time & Work"
              className="w-full mt-1 p-2.5 border rounded-xl"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700">Content Type</label>
            <select
              value={newNonPharma.contentType}
              onChange={e => setNewNonPharma({ ...newNonPharma, contentType: e.target.value })}
              className="w-full mt-1 p-2.5 border rounded-xl font-bold"
            >
              <option value="cbt">Interactive CBT Quiz</option>
              <option value="pdf">Downloadable PDF Capsule</option>
            </select>
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700">Resource Title</label>
          <input
            type="text"
            required
            value={newNonPharma.title}
            onChange={e => setNewNonPharma({ ...newNonPharma, title: e.target.value })}
            placeholder="e.g. Blood Relations 50 High-Yield MCQs Practice"
            className="w-full mt-1 p-2.5 border rounded-xl font-bold"
          />
        </div>

        {newNonPharma.contentType === 'pdf' ? (
          <div className="p-4 bg-slate-50 border rounded-2xl space-y-2">
            <label className="font-bold text-slate-700 block">PDF Capsule</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".pdf"
                onChange={e => handleFileUpload(e, url => setNewNonPharma({ ...newNonPharma, pdfUrl: url }))}
                className="text-xs"
              />
              {uploadingFile && <span className="text-xs text-blue-600 font-bold animate-pulse">Uploading...</span>}
            </div>
            <input
              type="text"
              value={newNonPharma.pdfUrl}
              onChange={e => setNewNonPharma({ ...newNonPharma, pdfUrl: e.target.value })}
              placeholder="Paste PDF link..."
              className="w-full p-2 border rounded-xl text-xs font-mono"
            />
          </div>
        ) : (
          <BulkQuestionParser
            onQuestionsParsed={parsed => setNonPharmaQuestions(prev => [...prev, ...parsed])}
            queueCount={nonPharmaQuestions.length}
            onClearQueue={() => setNonPharmaQuestions([])}
            defaultSubject={newNonPharma.section || 'General Studies'}
            title="⚡ Parse Aptitude MCQs"
            colorScheme="indigo"
          />
        )}

        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow cursor-pointer transition"
        >
          Save Non-Pharma Resource
        </button>
      </form>

      {/* Manage Non-Pharma Table */}
      <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h4 className="font-extrabold text-slate-900 text-base">
            Manage Non-Pharma Resources ({filteredNonPharma.length})
          </h4>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={nonPharmaSearch}
              onChange={e => {
                setNonPharmaSearch(e.target.value);
                setNonPharmaPage(1);
              }}
              placeholder="Search non-pharma by title or topic..."
              className="pl-8 pr-3 py-1.5 border rounded-xl text-xs bg-slate-50 focus:bg-white w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Section</th>
                <th className="p-3">Topic</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedNonPharma.map(np => (
                <tr key={np._id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3 font-bold text-slate-900">{np.title}</td>
                  <td className="p-3 font-semibold text-slate-700 capitalize">{np.section}</td>
                  <td className="p-3 text-slate-600">{np.topic || '—'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                      {np.contentType}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setEditModal({ open: true, type: 'nonPharma', data: { ...np } })}
                      className="px-2 py-1 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition inline-flex items-center space-x-1 font-bold cursor-pointer"
                      title="Edit Resource"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNonPharma(np._id)}
                      className="px-2 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition inline-flex items-center space-x-1 font-bold cursor-pointer"
                      title="Delete Resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredNonPharma.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400 italic">
                    No non-pharma resources match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalNonPharmaPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
            <div>
              Showing {Math.min((nonPharmaPage - 1) * ITEMS_PER_PAGE + 1, filteredNonPharma.length)} to{' '}
              {Math.min(nonPharmaPage * ITEMS_PER_PAGE, filteredNonPharma.length)} of {filteredNonPharma.length} items
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                disabled={nonPharmaPage === 1}
                onClick={() => setNonPharmaPage(nonPharmaPage - 1)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  nonPharmaPage === 1 ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 cursor-pointer'
                }`}
              >
                ← Prev
              </button>
              <span className="px-2">
                Page {nonPharmaPage} of {totalNonPharmaPages}
              </span>
              <button
                type="button"
                disabled={nonPharmaPage >= totalNonPharmaPages}
                onClick={() => setNonPharmaPage(nonPharmaPage + 1)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  nonPharmaPage >= totalNonPharmaPages ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 cursor-pointer'
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNonPharmaTab;
