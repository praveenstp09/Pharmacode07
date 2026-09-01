import React from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

const AdminEditModal = ({
  editModal,
  setEditModal,
  fetchAdminData,
  showToast,
  handleFileUpload,
}) => {
  if (!editModal.open || !editModal.data) return null;

  const handleUpdateItem = async e => {
    e.preventDefault();
    const { type, data } = editModal;
    if (!data) return;
    try {
      let res;
      if (type === 'series') {
        const isFreeSeries = Boolean(data.isFree || Number(data.discountPrice) === 0);
        res = await api.put(`/admin/test-series/${data._id}`, {
          ...data,
          price: isFreeSeries ? 0 : Number(data.price),
          discountPrice: isFreeSeries ? 0 : Number(data.discountPrice),
          isFree: isFreeSeries,
          highlights: (data.highlights || []).filter(h => h && h.trim() !== ''),
        });
      } else if (type === 'material') {
        res = await api.put(`/admin/materials/${data._id}`, data);
      } else if (type === 'singleModel') {
        res = await api.put(`/single-models/${data._id}`, data);
      } else if (type === 'nonPharma') {
        res = await api.put(`/non-pharma/${data._id}`, data);
      }
      if (res && res.data.success) {
        showToast('Item updated successfully!', 'success');
        setEditModal({ open: false, type: '', data: null });
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to update: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 animate-in fade-in">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              {editModal.type === 'series' && 'Edit Test Series Package'}
              {editModal.type === 'material' && 'Edit Study Material'}
              {editModal.type === 'singleModel' && 'Edit Single Model Paper'}
              {editModal.type === 'nonPharma' && 'Edit Non-Pharma Resource'}
            </h3>
            <p className="text-xs text-slate-500">Update pricing, content, or metadata</p>
          </div>
          <button
            type="button"
            onClick={() => setEditModal({ open: false, type: '', data: null })}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUpdateItem} className="space-y-4 text-xs sm:text-sm">
          {/* EDIT TEST SERIES */}
          {editModal.type === 'series' && (
            <>
              <div>
                <label className="font-bold text-slate-700">Package Title</label>
                <input
                  type="text"
                  required
                  value={editModal.data.title || ''}
                  onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, title: e.target.value } })}
                  className="w-full mt-1 p-2.5 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Exam Type</label>
                  <input
                    type="text"
                    required
                    value={editModal.data.examType || ''}
                    onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, examType: e.target.value } })}
                    className="w-full mt-1 p-2.5 border rounded-xl uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Validity (Days)</label>
                  <input
                    type="number"
                    value={editModal.data.validityDays || 365}
                    onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, validityDays: Number(e.target.value) } })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={editModal.data.price || 0}
                    onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, price: Number(e.target.value) } })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={editModal.data.discountPrice || 0}
                    onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, discountPrice: Number(e.target.value) } })}
                    className="w-full mt-1 p-2.5 border rounded-xl font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <input
                  type="checkbox"
                  id="edit-series-free-check"
                  checked={editModal.data.isFree || false}
                  onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, isFree: e.target.checked } })}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="edit-series-free-check" className="text-xs font-bold text-emerald-900 cursor-pointer">
                  🟢 Free Test Series Package (₹0 - Unlocked for all students)
                </label>
              </div>
              <div>
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={editModal.data.description || ''}
                  onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, description: e.target.value } })}
                  className="w-full mt-1 p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Cover Thumbnail</label>
                <div className="mt-1 flex items-center space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    id="editSeriesThumbnailUpload"
                    className="hidden"
                    onChange={e => handleFileUpload(e, url => setEditModal({ ...editModal, data: { ...editModal.data, thumbnail: url } }))}
                  />
                  <label
                    htmlFor="editSeriesThumbnailUpload"
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    <span>📷 Change Image</span>
                  </label>
                  {editModal.data.thumbnail && (
                    <img src={editModal.data.thumbnail} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-xs" />
                  )}
                </div>
              </div>
              {/* Highlights Editor */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Highlights (Green Tick Points)</label>
                  <button
                    type="button"
                    onClick={() => setEditModal({
                      ...editModal,
                      data: { ...editModal.data, highlights: [...(editModal.data.highlights || []), ''] }
                    })}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    + Add Point
                  </button>
                </div>
                <div className="space-y-1.5 mt-1.5">
                  {(editModal.data.highlights || []).map((h, hIdx) => (
                    <div key={hIdx} className="flex items-center space-x-2">
                      <span className="text-emerald-600 font-bold text-xs">✓</span>
                      <input
                        type="text"
                        value={h}
                        onChange={e => {
                          const updated = [...(editModal.data.highlights || [])];
                          updated[hIdx] = e.target.value;
                          setEditModal({ ...editModal, data: { ...editModal.data, highlights: updated } });
                        }}
                        placeholder={`Highlight point ${hIdx + 1}...`}
                        className="flex-grow p-1.5 border rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editModal.data.highlights || []).filter((_, i) => i !== hIdx);
                          setEditModal({ ...editModal, data: { ...editModal.data, highlights: updated } });
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1 text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* EDIT STUDY MATERIAL */}
          {editModal.type === 'material' && (
            <>
              <div>
                <label className="font-bold text-slate-700">Title</label>
                <input
                  type="text"
                  required
                  value={editModal.data.title || ''}
                  onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, title: e.target.value } })}
                  className="w-full mt-1 p-2.5 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Course Type</label>
                  <input
                    type="text"
                    value={editModal.data.courseType || ''}
                    onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, courseType: e.target.value } })}
                    className="w-full mt-1 p-2.5 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Subject</label>
                  <input
                    type="text"
                    value={editModal.data.subject || ''}
                    onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, subject: e.target.value } })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={editModal.data.price || 0}
                    onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, price: Number(e.target.value) } })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={editModal.data.discountPrice || 0}
                    onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, discountPrice: Number(e.target.value) } })}
                    className="w-full mt-1 p-2.5 border rounded-xl font-bold text-emerald-600"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700">PDF File URL</label>
                <input
                  type="text"
                  value={editModal.data.fileUrl || ''}
                  onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, fileUrl: e.target.value } })}
                  className="w-full mt-1 p-2.5 border rounded-xl text-xs font-mono"
                />
              </div>
            </>
          )}

          {/* EDIT SINGLE MODEL PAPER */}
          {editModal.type === 'singleModel' && (
            <>
              <div>
                <label className="font-bold text-slate-700">Title</label>
                <input
                  type="text"
                  required
                  value={editModal.data.title || ''}
                  onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, title: e.target.value } })}
                  className="w-full mt-1 p-2.5 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Exam Type</label>
                  <input
                    type="text"
                    required
                    value={editModal.data.examType || ''}
                    onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, examType: e.target.value } })}
                    className="w-full mt-1 p-2.5 border rounded-xl uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={editModal.data.price || 0}
                    onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, price: Number(e.target.value) } })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={editModal.data.discountPrice || 0}
                    onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, discountPrice: Number(e.target.value) } })}
                    className="w-full mt-1 p-2.5 border rounded-xl font-bold text-emerald-600"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700">PDF URL</label>
                <input
                  type="text"
                  value={editModal.data.pdfUrl || ''}
                  onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, pdfUrl: e.target.value } })}
                  className="w-full mt-1 p-2.5 border rounded-xl text-xs font-mono"
                />
              </div>
              <div className="flex items-center space-x-2 bg-emerald-50 p-3 rounded-xl">
                <input
                  type="checkbox"
                  id="edit-single-demo"
                  checked={Boolean(editModal.data.isFree)}
                  onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, isFree: e.target.checked } })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="edit-single-demo" className="text-xs font-bold text-emerald-900 cursor-pointer">
                  🟢 Free Model Paper
                </label>
              </div>
            </>
          )}

          {/* EDIT NON-PHARMA RESOURCE */}
          {editModal.type === 'nonPharma' && (
            <>
              <div>
                <label className="font-bold text-slate-700">Resource Title</label>
                <input
                  type="text"
                  required
                  value={editModal.data.title || ''}
                  onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, title: e.target.value } })}
                  className="w-full mt-1 p-2.5 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Section</label>
                  <select
                    value={editModal.data.section || 'reasoning'}
                    onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, section: e.target.value } })}
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
                    value={editModal.data.topic || ''}
                    onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, topic: e.target.value } })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700">PDF URL</label>
                <input
                  type="text"
                  value={editModal.data.pdfUrl || ''}
                  onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, pdfUrl: e.target.value } })}
                  className="w-full mt-1 p-2.5 border rounded-xl text-xs font-mono"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setEditModal({ open: false, type: '', data: null })}
              className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow cursor-pointer transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditModal;
