import React, { useState, useEffect } from 'react';
import { Search, Edit3, Trash2 } from 'lucide-react';
import api from '../../services/api';
import BulkQuestionParser from './BulkQuestionParser';

const ITEMS_PER_PAGE = 8;

const AdminTestSeriesTab = ({
  seriesList,
  fetchAdminData,
  setEditModal,
  showToast,
  handleFileUpload,
  uploadingFile,
}) => {
  // New Test Series Form State
  const [newSeries, setNewSeries] = useState({
    title: '',
    slug: '',
    examType: 'GSSSB',
    category: 'Competitive Exam',
    price: 499,
    discountPrice: 199,
    isFree: false,
    validityDays: 365,
    description: '',
    thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
    highlights: [
      '5 Full-Length Model Papers with real exam timer',
      'Negative marking (-0.25) & Instant explanations',
      'All 3 sub-folders unlocked with 365-day access',
    ],
  });

  // Folder Item Form State (for selected Series)
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [packageFolderItems, setPackageFolderItems] = useState([]);
  const [loadingPackageItems, setLoadingPackageItems] = useState(false);
  const [folderForm, setFolderForm] = useState({
    folderType: 'model_papers',
    contentType: 'cbt',
    title: '',
    subjectName: 'Pharmacology',
    pdfUrl: '',
    year: 2026,
    isFreeDemo: false,
    durationMinutes: 100,
    positiveMarks: 1,
    negativeMarks: 0.25,
  });
  const [folderQuestionsQueue, setFolderQuestionsQueue] = useState([]);

  // Search & Pagination States
  const [seriesSearch, setSeriesSearch] = useState('');
  const [seriesPage, setSeriesPage] = useState(1);

  // Initialize selected series when seriesList loads
  useEffect(() => {
    if (!selectedSeriesId && seriesList && seriesList.length > 0) {
      setSelectedSeriesId(seriesList[0]._id);
    }
  }, [seriesList, selectedSeriesId]);

  const fetchPackageItems = async seriesId => {
    if (!seriesId) {
      setPackageFolderItems([]);
      return;
    }
    setLoadingPackageItems(true);
    try {
      const res = await api.get(`/admin/test-series/${seriesId}/folders`);
      if (res.data.success) {
        setPackageFolderItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch package folder items:', err);
    } finally {
      setLoadingPackageItems(false);
    }
  };

  useEffect(() => {
    if (selectedSeriesId) {
      fetchPackageItems(selectedSeriesId);
    }
  }, [selectedSeriesId]);

  const handleCreateSeries = async e => {
    e.preventDefault();
    try {
      const isFreeSeries = Boolean(newSeries.isFree || Number(newSeries.discountPrice) === 0);
      const slug =
        newSeries.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') +
        '-' + Date.now();
      const res = await api.post('/admin/test-series', {
        ...newSeries,
        price: isFreeSeries ? 0 : Number(newSeries.price),
        discountPrice: isFreeSeries ? 0 : Number(newSeries.discountPrice),
        isFree: isFreeSeries,
        slug,
        highlights: (newSeries.highlights || []).filter(h => h && h.trim() !== ''),
      });
      if (res.data.success) {
        showToast('Test Series Package created successfully!', 'success');
        if (res.data.data?._id) {
          setSelectedSeriesId(res.data.data._id);
        }
        setNewSeries({
          title: '',
          slug: '',
          examType: 'GSSSB',
          category: 'Competitive Exam',
          price: 499,
          discountPrice: 199,
          isFree: false,
          validityDays: 365,
          description: '',
          thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
          highlights: [
            '5 Full-Length Model Papers with real exam timer',
            'Negative marking (-0.25) & Instant explanations',
            'All 3 sub-folders unlocked with 365-day access',
          ],
        });
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to create series: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDeleteSeries = async id => {
    if (!window.confirm('Are you sure you want to delete this Test Series Package? This will delete all its folders and questions.')) return;
    try {
      const res = await api.delete(`/admin/test-series/${id}`);
      if (res.data.success) {
        showToast('Test Series deleted successfully', 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to delete: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleAddFolderItem = async e => {
    e.preventDefault();
    if (!selectedSeriesId) {
      showToast('Please select a Test Series first!', 'warning');
      return;
    }
    try {
      const res = await api.post(`/admin/test-series/${selectedSeriesId}/folders`, {
        ...folderForm,
        durationMinutes: Number(folderForm.durationMinutes) || 100,
        positiveMarks: Number(folderForm.positiveMarks) || 1,
        negativeMarks: folderForm.negativeMarks !== undefined && folderForm.negativeMarks !== '' ? Number(folderForm.negativeMarks) : 0.25,
        questions: folderForm.contentType === 'cbt' ? folderQuestionsQueue : [],
      });
      if (res.data.success) {
        showToast('Item added to folder successfully!', 'success');
        setFolderQuestionsQueue([]);
        setFolderForm({
          ...folderForm,
          title: '',
          pdfUrl: '',
        });
        fetchPackageItems(selectedSeriesId);
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDeleteFolderItem = async (itemId, itemTitle) => {
    if (!window.confirm(`Are you sure you want to remove "${itemTitle}" from this test series package?`)) return;
    try {
      const res = await api.delete(`/admin/folders/${itemId}`);
      if (res.data.success) {
        showToast('Item removed from package successfully!', 'success');
        fetchPackageItems(selectedSeriesId);
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to remove: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  // Filter & Pagination
  const filteredSeries = seriesList.filter(s =>
    !seriesSearch ||
    s.title?.toLowerCase().includes(seriesSearch.toLowerCase()) ||
    s.examType?.toLowerCase().includes(seriesSearch.toLowerCase())
  );
  const paginatedSeries = filteredSeries.slice((seriesPage - 1) * ITEMS_PER_PAGE, seriesPage * ITEMS_PER_PAGE);
  const totalSeriesPages = Math.ceil(filteredSeries.length / ITEMS_PER_PAGE) || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* ── LEFT COLUMN: Create New Test Series Package Form ── */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">Create New Test Series Package</h3>
        <form onSubmit={handleCreateSeries} className="space-y-3 text-xs sm:text-sm">
          <div>
            <label className="font-bold text-slate-700">Package Title</label>
            <input
              type="text"
              required
              value={newSeries.title}
              onChange={e => setNewSeries({ ...newSeries, title: e.target.value })}
              placeholder="e.g. AIIMS Pharmacist 2026 4-Folder Prep Pack"
              className="w-full mt-1 p-2.5 border rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700">Exam Type</label>
              <input
                type="text"
                required
                value={newSeries.examType}
                onChange={e => setNewSeries({ ...newSeries, examType: e.target.value })}
                className="w-full mt-1 p-2.5 border rounded-xl uppercase font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Validity (Days)</label>
              <input
                type="number"
                value={newSeries.validityDays}
                onChange={e => setNewSeries({ ...newSeries, validityDays: e.target.value })}
                className="w-full mt-1 p-2.5 border rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700">MRP Price (₹)</label>
              <input
                type="number"
                value={newSeries.price}
                onChange={e => setNewSeries({ ...newSeries, price: e.target.value })}
                className="w-full mt-1 p-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Selling Price (₹)</label>
              <input
                type="number"
                value={newSeries.discountPrice}
                onChange={e => setNewSeries({ ...newSeries, discountPrice: e.target.value })}
                className="w-full mt-1 p-2.5 border rounded-xl font-bold text-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <input
              type="checkbox"
              id="series-free-check"
              checked={newSeries.isFree || false}
              onChange={e => setNewSeries({ ...newSeries, isFree: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
            />
            <label htmlFor="series-free-check" className="text-xs font-bold text-emerald-900 cursor-pointer">
              🟢 Free Test Series Package (₹0 - Unlocked for all students)
            </label>
          </div>
          <div>
            <label className="font-bold text-slate-700">Description</label>
            <textarea
              rows={2}
              value={newSeries.description}
              onChange={e => setNewSeries({ ...newSeries, description: e.target.value })}
              className="w-full mt-1 p-2.5 border rounded-xl"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700">Package Thumbnail (Cover Image)</label>
            <div className="mt-1 flex items-center space-x-3">
              <input
                type="file"
                accept="image/*"
                id="seriesThumbnailUpload"
                className="hidden"
                onChange={e => handleFileUpload(e, url => setNewSeries({ ...newSeries, thumbnail: url }))}
              />
              <label
                htmlFor="seriesThumbnailUpload"
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition flex items-center space-x-1.5"
              >
                <span>📷 {uploadingFile ? 'Uploading...' : 'Upload Cover Image'}</span>
              </label>
              {newSeries.thumbnail && (
                <img
                  src={newSeries.thumbnail}
                  alt="Thumbnail Preview"
                  className="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-sm"
                />
              )}
            </div>
          </div>

          {/* Highlights (Green Tick Points) Manager */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs">Highlights (Green Tick Points)</label>
              <button
                type="button"
                onClick={() => setNewSeries({ ...newSeries, highlights: [...(newSeries.highlights || []), ''] })}
                className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
              >
                + Add Point
              </button>
            </div>
            <div className="space-y-1.5">
              {(newSeries.highlights || []).map((h, hIdx) => (
                <div key={hIdx} className="flex items-center space-x-2">
                  <span className="text-emerald-600 font-bold text-xs">✓</span>
                  <input
                    type="text"
                    value={h}
                    onChange={e => {
                      const updated = [...newSeries.highlights];
                      updated[hIdx] = e.target.value;
                      setNewSeries({ ...newSeries, highlights: updated });
                    }}
                    placeholder={`e.g. 5 Full-Length Mock Papers (${hIdx + 1})`}
                    className="flex-grow p-1.5 bg-white border rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = newSeries.highlights.filter((_, i) => i !== hIdx);
                      setNewSeries({ ...newSeries, highlights: updated });
                    }}
                    className="text-rose-500 hover:text-rose-700 p-1 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow cursor-pointer transition"
          >
            Create Package
          </button>
        </form>
      </div>

      {/* ── RIGHT COLUMN: Add Content Item to Package Folders ── */}
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-base">Add Content Item to Package Folders</h3>
          <p className="text-xs text-slate-500">Select which folder this CBT or PDF belongs to.</p>
        </div>

        <form onSubmit={handleAddFolderItem} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="font-bold text-slate-700">Select Target Package</label>
            <select
              value={selectedSeriesId || ''}
              onChange={e => setSelectedSeriesId(e.target.value)}
              className="w-full mt-1 p-2.5 border rounded-xl font-bold bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>-- Select a Test Series Package --</option>
              {seriesList.map(s => (
                <option key={s._id} value={s._id}>
                  {s.title} ({s.examType})
                </option>
              ))}
            </select>
            {seriesList.length === 0 && (
              <p className="text-[11px] text-amber-600 font-semibold mt-1">
                ⚠️ No test series package created yet. Please create a package on the left first.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700">Target Folder</label>
              <select
                value={folderForm.folderType}
                onChange={e => setFolderForm({ ...folderForm, folderType: e.target.value, contentType: 'cbt' })}
                className="w-full mt-1 p-2.5 border rounded-xl font-bold"
              >
                <option value="model_papers">📝 Folder 1: Model Papers</option>
                <option value="previous_year_papers">📄 Folder 2: Previous Year Papers</option>
                <option value="subject_wise_tests">📚 Folder 3: Subject-Wise Tests</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700">Exam Mode</label>
              <div className="w-full mt-1 p-2.5 bg-slate-50 border rounded-xl font-bold text-xs text-slate-700 flex items-center space-x-1.5">
                <span>⚡</span>
                <span>Interactive Online CBT Exam</span>
              </div>
            </div>
          </div>

          {(folderForm.folderType === 'subject_wise_tests' || folderForm.folderType === 'subject_wise') && (
            <div>
              <label className="font-bold text-slate-700">Subject Name</label>
              <input
                type="text"
                required
                value={folderForm.subjectName}
                onChange={e => setFolderForm({ ...folderForm, subjectName: e.target.value })}
                placeholder="e.g. Pharmacology, Pharmaceutics, Pharmaceutical Chemistry"
                className="w-full mt-1 p-2.5 border rounded-xl font-semibold"
              />
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700">Item Title</label>
            <input
              type="text"
              required
              value={folderForm.title}
              onChange={e => setFolderForm({ ...folderForm, title: e.target.value })}
              placeholder="e.g. AIIMS Pharmacist Model CBT 1 or 2023 Solved Paper"
              className="w-full mt-1 p-2.5 border rounded-xl font-bold"
            />
          </div>

          <div className="flex items-center space-x-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <input
              type="checkbox"
              id="demo-check"
              checked={folderForm.isFreeDemo}
              onChange={e => setFolderForm({ ...folderForm, isFreeDemo: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
            />
            <label htmlFor="demo-check" className="text-xs font-bold text-emerald-900 cursor-pointer">
              🟢 Set as Free Demo (Unlocked for all students to preview)
            </label>
          </div>

          {/* Exam Duration & Marks Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <label className="font-bold text-slate-700 text-xs">Duration (Minutes)</label>
              <input
                type="number"
                min="1"
                value={folderForm.durationMinutes}
                onChange={e => setFolderForm({ ...folderForm, durationMinutes: e.target.value })}
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
                value={folderForm.positiveMarks}
                onChange={e => setFolderForm({ ...folderForm, positiveMarks: e.target.value })}
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
                value={folderForm.negativeMarks}
                onChange={e => setFolderForm({ ...folderForm, negativeMarks: e.target.value })}
                placeholder="0 for no negative mark"
                className="w-full mt-1 p-2 bg-white border rounded-xl font-bold text-xs text-rose-600"
              />
            </div>
          </div>

          {/* PDF Document Section (Enabled for PYQ Folder) */}
          {folderForm.folderType === 'pyq' && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-indigo-950 text-xs flex items-center space-x-1.5">
                  <span>📄 Solved Official Question Paper PDF</span>
                  <span className="text-[10px] text-indigo-600 font-normal">(Optional if uploading CBT questions)</span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={e => handleFileUpload(e, url => setFolderForm({ ...folderForm, pdfUrl: url }))}
                  className="text-xs"
                />
                {uploadingFile && <span className="text-xs text-blue-600 font-bold animate-pulse">Uploading...</span>}
              </div>
              <input
                type="text"
                value={folderForm.pdfUrl}
                onChange={e => setFolderForm({ ...folderForm, pdfUrl: e.target.value })}
                placeholder="Or paste direct PDF URL..."
                className="w-full p-2 border rounded-xl text-xs font-mono bg-white"
              />
            </div>
          )}

          {/* Bulk MCQ Questions Parser */}
          <BulkQuestionParser
            onQuestionsParsed={parsed => setFolderQuestionsQueue(prev => [...prev, ...parsed])}
            queueCount={folderQuestionsQueue.length}
            onClearQueue={() => setFolderQuestionsQueue([])}
            defaultSubject={folderForm.subjectName || 'General Pharmacy'}
            title="⚡ Bulk MCQ Text Parser (CBT Simulator Mode)"
            colorScheme="blue"
          />

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer transition"
          >
            Save Item to Package Folder
          </button>
        </form>

        {/* List and Remove Items in Currently Selected Package */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">
                Papers & Items Inside Selected Package ({packageFolderItems.length})
              </h4>
              <p className="text-[11px] text-slate-500">
                Review and remove any Model Paper, PYQ, or Subject-Wise test in this package.
              </p>
            </div>
            {selectedSeriesId && (
              <button
                type="button"
                onClick={() => fetchPackageItems(selectedSeriesId)}
                className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Refresh List
              </button>
            )}
          </div>

          {loadingPackageItems ? (
            <div className="p-4 text-center text-xs text-slate-400">Loading package items...</div>
          ) : packageFolderItems.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
              No items added to this package yet. Use the form above to add Model Papers, PYQs, or Subject Tests.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {packageFolderItems.map(item => {
                const folderLabel =
                  item.folderType === 'model_papers' || item.folderType === 'cbt_mixed'
                    ? '📝 Model Paper'
                    : item.folderType === 'previous_year_papers' || item.folderType === 'pyq'
                    ? '📄 Previous Year Paper'
                    : '📚 Subject Test';

                const paper = item.testPaperId;

                return (
                  <div
                    key={item._id}
                    className="p-3 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 flex items-center justify-between transition gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold text-[10px] rounded-md">
                          {folderLabel}
                        </span>
                        {(item.folderType === 'subject_wise_tests' || item.folderType === 'subject_wise') && item.subjectName && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-extrabold text-[10px] rounded-md border border-purple-200">
                            📚 {item.subjectName}
                          </span>
                        )}
                        {item.isFreeDemo && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
                            🟢 Free Demo
                          </span>
                        )}
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                        <span>⏱️ {item.durationMinutes || paper?.durationMinutes || 100} mins</span>
                        {paper && (
                          <>
                            <span>❓ {paper.questions?.length || item.totalQuestions || 0} Qs</span>
                            <span>➕ +{paper.positiveMarks ?? 1}</span>
                            <span>➖ -{paper.negativeMarks ?? 0.25}</span>
                          </>
                        )}
                        {item.pdfUrl && <span className="text-indigo-600 font-semibold">📄 PDF</span>}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteFolderItem(item._id, item.title)}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-lg border border-rose-200 transition flex items-center space-x-1 cursor-pointer flex-shrink-0"
                      title="Delete this paper from package"
                    >
                      <span>🗑️</span>
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── FULL WIDTH BOTTOM: Manage Test Series Packages Table ── */}
      <div className="lg:col-span-12 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Manage Test Series Packages ({filteredSeries.length})
            </h3>
            <p className="text-xs text-slate-500">Edit pricing, thumbnail cover, highlights, or remove packages.</p>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={seriesSearch}
              onChange={e => {
                setSeriesSearch(e.target.value);
                setSeriesPage(1);
              }}
              placeholder="Search packages by title or exam..."
              className="pl-8 pr-3 py-1.5 border rounded-xl text-xs bg-slate-50 focus:bg-white w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b">
              <tr>
                <th className="p-3">Package</th>
                <th className="p-3">Exam</th>
                <th className="p-3">Pricing</th>
                <th className="p-3">Validity</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSeries.map(s => (
                <tr key={s._id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3">
                    <div className="flex items-center space-x-3">
                      {s.thumbnail && (
                        <img src={s.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-xs" />
                      )}
                      <div>
                        <div className="font-bold text-slate-900">{s.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{s.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-bold text-slate-700">{s.examType}</td>
                  <td className="p-3">
                    <span className="font-bold text-emerald-600">₹{s.discountPrice}</span>
                    <span className="text-slate-400 line-through ml-1.5 text-xs">₹{s.price}</span>
                  </td>
                  <td className="p-3 text-slate-600">{s.validityDays || 365} Days</td>
                  <td className="p-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setEditModal({ open: true, type: 'series', data: { ...s } })}
                      className="px-2.5 py-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition inline-flex items-center space-x-1 text-xs font-bold cursor-pointer"
                      title="Edit Package"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSeries(s._id)}
                      className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition inline-flex items-center space-x-1 text-xs font-bold cursor-pointer"
                      title="Delete Package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSeries.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400 italic">
                    No test series packages match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalSeriesPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
            <div>
              Showing {Math.min((seriesPage - 1) * ITEMS_PER_PAGE + 1, filteredSeries.length)} to{' '}
              {Math.min(seriesPage * ITEMS_PER_PAGE, filteredSeries.length)} of {filteredSeries.length} items
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                disabled={seriesPage === 1}
                onClick={() => setSeriesPage(seriesPage - 1)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  seriesPage === 1 ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 cursor-pointer'
                }`}
              >
                ← Prev
              </button>
              <span className="px-2">
                Page {seriesPage} of {totalSeriesPages}
              </span>
              <button
                type="button"
                disabled={seriesPage >= totalSeriesPages}
                onClick={() => setSeriesPage(seriesPage + 1)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  seriesPage >= totalSeriesPages ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 cursor-pointer'
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

export default AdminTestSeriesTab;
