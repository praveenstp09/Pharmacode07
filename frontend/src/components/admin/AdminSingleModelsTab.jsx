import React, { useState } from 'react';
import { Search, Edit3, Trash2 } from 'lucide-react';
import api from '../../services/api';
import BulkQuestionParser from './BulkQuestionParser';

const ITEMS_PER_PAGE = 8;

const AdminSingleModelsTab = ({
  singleModelsList,
  fetchAdminData,
  setEditModal,
  showToast,
  handleFileUpload,
  uploadingFile,
}) => {
  const [newSingleModel, setNewSingleModel] = useState({
    title: '',
    examType: 'AIIMS',
    description: '',
    hasCBT: true,
    hasPdf: true,
    pdfUrl: '',
    price: 49,
    discountPrice: 29,
    isFree: false,
    durationMinutes: 100,
    positiveMarks: 1,
    negativeMarks: 0.25,
  });
  const [singleModelQuestions, setSingleModelQuestions] = useState([]);

  const [singleModelsSearch, setSingleModelsSearch] = useState('');
  const [singleModelsPage, setSingleModelsPage] = useState(1);

  const handleCreateSingleModel = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/single-models', {
        ...newSingleModel,
        durationMinutes: Number(newSingleModel.durationMinutes) || 100,
        positiveMarks: Number(newSingleModel.positiveMarks) || 1,
        negativeMarks: newSingleModel.negativeMarks !== undefined && newSingleModel.negativeMarks !== '' ? Number(newSingleModel.negativeMarks) : 0.25,
        questions: newSingleModel.hasCBT ? singleModelQuestions : [],
      });
      if (res.data.success) {
        showToast('Single Model Paper created successfully!', 'success');
        setSingleModelQuestions([]);
        setNewSingleModel({
          title: '',
          examType: 'AIIMS',
          description: '',
          hasCBT: true,
          hasPdf: true,
          pdfUrl: '',
          price: 49,
          discountPrice: 29,
          isFree: false,
          durationMinutes: 100,
          positiveMarks: 1,
          negativeMarks: 0.25,
        });
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDeleteSingleModel = async id => {
    if (!window.confirm('Are you sure you want to delete this Single Model Paper?')) return;
    try {
      const res = await api.delete(`/single-models/${id}`);
      if (res.data.success) {
        showToast('Model Paper deleted successfully', 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to delete: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const filteredSingleModels = singleModelsList.filter(sm =>
    !singleModelsSearch ||
    sm.title?.toLowerCase().includes(singleModelsSearch.toLowerCase()) ||
    sm.examType?.toLowerCase().includes(singleModelsSearch.toLowerCase())
  );
  const paginatedSingleModels = filteredSingleModels.slice((singleModelsPage - 1) * ITEMS_PER_PAGE, singleModelsPage * ITEMS_PER_PAGE);
  const totalSingleModelPages = Math.ceil(filteredSingleModels.length / ITEMS_PER_PAGE) || 1;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <h3 className="font-extrabold text-slate-900 text-lg">
        Single Model Papers Creator (A-La-Carte)
      </h3>

      <form onSubmit={handleCreateSingleModel} className="space-y-4 text-xs sm:text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-bold text-slate-700">Exam Type</label>
            <input
              type="text"
              required
              value={newSingleModel.examType}
              onChange={e => setNewSingleModel({ ...newSingleModel, examType: e.target.value })}
              placeholder="e.g. AIIMS, ESIC, GSSSB"
              className="w-full mt-1 p-2.5 border rounded-xl uppercase font-bold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700">MRP Price (₹)</label>
            <input
              type="number"
              value={newSingleModel.price}
              onChange={e => setNewSingleModel({ ...newSingleModel, price: e.target.value })}
              className="w-full mt-1 p-2.5 border rounded-xl"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700">Selling Price (₹)</label>
            <input
              type="number"
              value={newSingleModel.discountPrice}
              onChange={e => setNewSingleModel({ ...newSingleModel, discountPrice: e.target.value })}
              className="w-full mt-1 p-2.5 border rounded-xl font-bold text-emerald-600"
            />
          </div>
        </div>

        {/* Exam Duration & Marks Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <div>
            <label className="font-bold text-slate-700 text-xs">Duration (Minutes)</label>
            <input
              type="number"
              min="1"
              value={newSingleModel.durationMinutes}
              onChange={e => setNewSingleModel({ ...newSingleModel, durationMinutes: e.target.value })}
              placeholder="e.g. 100"
              className="w-full mt-1 p-2 bg-white border rounded-xl font-bold text-xs"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 text-xs">Positive Mark (+)</label>
            <input
              type="number"
              step="0.25"
              min="0.25"
              value={newSingleModel.positiveMarks}
              onChange={e => setNewSingleModel({ ...newSingleModel, positiveMarks: e.target.value })}
              placeholder="e.g. 1"
              className="w-full mt-1 p-2 bg-white border rounded-xl font-bold text-xs text-emerald-600"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 text-xs">Negative Mark (-)</label>
            <input
              type="number"
              step="0.05"
              min="0"
              value={newSingleModel.negativeMarks}
              onChange={e => setNewSingleModel({ ...newSingleModel, negativeMarks: e.target.value })}
              placeholder="0 for no negative mark"
              className="w-full mt-1 p-2 bg-white border rounded-xl font-bold text-xs text-rose-600"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700">Model Paper Title</label>
          <input
            type="text"
            required
            value={newSingleModel.title}
            onChange={e => setNewSingleModel({ ...newSingleModel, title: e.target.value })}
            placeholder="e.g. AIIMS Pharmacist Grade-II Official Model Paper 2"
            className="w-full mt-1 p-2.5 border rounded-xl font-bold"
          />
        </div>

        <div className="flex items-center space-x-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
          <input
            type="checkbox"
            id="single-demo"
            checked={newSingleModel.isFree}
            onChange={e => setNewSingleModel({ ...newSingleModel, isFree: e.target.checked })}
            className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
          />
          <label htmlFor="single-demo" className="text-xs font-bold text-emerald-900 cursor-pointer">
            🟢 Free Model Paper (No payment required)
          </label>
        </div>

        <div className="p-4 bg-slate-50 border rounded-2xl space-y-2">
          <label className="font-bold text-slate-700 block">PDF Answer Key / Question Paper</label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".pdf"
              onChange={e => handleFileUpload(e, url => setNewSingleModel({ ...newSingleModel, pdfUrl: url }))}
              className="text-xs"
            />
            {uploadingFile && <span className="text-xs text-blue-600 font-bold animate-pulse">Uploading...</span>}
          </div>
          <input
            type="text"
            value={newSingleModel.pdfUrl}
            onChange={e => setNewSingleModel({ ...newSingleModel, pdfUrl: e.target.value })}
            placeholder="Paste PDF link..."
            className="w-full p-2 border rounded-xl text-xs font-mono"
          />
        </div>

        {/* Bulk MCQ Parser */}
        <BulkQuestionParser
          onQuestionsParsed={parsed => setSingleModelQuestions(prev => [...prev, ...parsed])}
          queueCount={singleModelQuestions.length}
          onClearQueue={() => setSingleModelQuestions([])}
          defaultSubject={newSingleModel.examType || 'General Pharmacy'}
          title="⚡ CBT MCQs Queue (CBT Simulator Mode)"
          colorScheme="blue"
        />

        <button
          type="submit"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer transition"
        >
          Publish Model Paper
        </button>
      </form>

      {/* Manage Single Model Papers Table */}
      <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h4 className="font-extrabold text-slate-900 text-base">
            Manage Single Model Papers ({filteredSingleModels.length})
          </h4>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={singleModelsSearch}
              onChange={e => {
                setSingleModelsSearch(e.target.value);
                setSingleModelsPage(1);
              }}
              placeholder="Search model papers by title or exam..."
              className="pl-8 pr-3 py-1.5 border rounded-xl text-xs bg-slate-50 focus:bg-white w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Exam</th>
                <th className="p-3">Pricing</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSingleModels.map(sm => (
                <tr key={sm._id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3 font-bold text-slate-900">{sm.title}</td>
                  <td className="p-3 font-semibold text-slate-700">{sm.examType}</td>
                  <td className="p-3">
                    {sm.isFree ? (
                      <span className="text-emerald-700 font-bold">🟢 Free</span>
                    ) : (
                      <>
                        <span className="font-bold text-emerald-600">₹{sm.discountPrice}</span>
                        <span className="text-slate-400 line-through ml-1.5 text-[11px]">₹{sm.price}</span>
                      </>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                      {sm.hasCBT ? 'CBT' : 'PDF'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setEditModal({ open: true, type: 'singleModel', data: { ...sm } })}
                      className="px-2 py-1 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition inline-flex items-center space-x-1 font-bold cursor-pointer"
                      title="Edit Single Model"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSingleModel(sm._id)}
                      className="px-2 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition inline-flex items-center space-x-1 font-bold cursor-pointer"
                      title="Delete Single Model"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSingleModels.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400 italic">
                    No single model papers match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalSingleModelPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
            <div>
              Showing {Math.min((singleModelsPage - 1) * ITEMS_PER_PAGE + 1, filteredSingleModels.length)} to{' '}
              {Math.min(singleModelsPage * ITEMS_PER_PAGE, filteredSingleModels.length)} of {filteredSingleModels.length} items
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                disabled={singleModelsPage === 1}
                onClick={() => setSingleModelsPage(singleModelsPage - 1)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  singleModelsPage === 1 ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 cursor-pointer'
                }`}
              >
                ← Prev
              </button>
              <span className="px-2">
                Page {singleModelsPage} of {totalSingleModelPages}
              </span>
              <button
                type="button"
                disabled={singleModelsPage >= totalSingleModelPages}
                onClick={() => setSingleModelsPage(singleModelsPage + 1)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  singleModelsPage >= totalSingleModelPages ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 cursor-pointer'
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

export default AdminSingleModelsTab;
