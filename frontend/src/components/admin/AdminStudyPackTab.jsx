import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Upload,
  CheckCircle2,
  Search,
  Layers,
  Sparkles,
  Zap,
  GraduationCap,
  Eye,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminStudyPackTab = () => {
  const { showToast } = useToast();

  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackId, setSelectedPackId] = useState('');
  const [packItems, setPackItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Upload state
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  // New Pack Form
  const [newPack, setNewPack] = useState({
    title: '',
    description: '',
    courseType: 'B.Pharm',
    scopeLabel: 'Semester 1-8',
    price: 999,
    discountPrice: 499,
    isFree: false,
    validityDays: 365,
    thumbnail: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80',
    highlights: ['All Semesters / Topics Covered', 'Comprehensive High-Yield Notes', 'Downloadable & Printable PDFs'],
  });

  // Add Item to Pack Form
  const [newItem, setNewItem] = useState({
    folderName: 'Semester 1',
    subjectName: '',
    chapterName: '',
    title: '',
    pdfUrl: '',
    pageCount: 0,
    isFreeDemo: false,
  });

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Pack Modal state
  const [editModal, setEditModal] = useState({
    isOpen: false,
    pack: null,
  });

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/study-packs');
      if (res.data.success) {
        const list = res.data.data || [];
        setPacks(list);
        if (list.length > 0 && !selectedPackId) {
          setSelectedPackId(list[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load study packs', err);
      showToast('Failed to load study packs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackItems = async (packId) => {
    if (!packId) {
      setPackItems([]);
      return;
    }
    setLoadingItems(true);
    try {
      const res = await api.get(`/admin/study-packs/${packId}/items`);
      if (res.data.success) {
        setPackItems(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load pack items', err);
    } finally {
      setLoadingItems(false);
    }
  };

  const currentSelectedPack = packs.find((p) => p._id === selectedPackId);
  const isCurrentQuickNotes =
    currentSelectedPack?.courseType === 'QuickRevision' ||
    Boolean(currentSelectedPack?.title?.toLowerCase().includes('quick'));

  useEffect(() => {
    if (selectedPackId) {
      fetchPackItems(selectedPackId);
    }
  }, [selectedPackId]);

  useEffect(() => {
    if (isCurrentQuickNotes && newItem.folderName === 'Semester 1') {
      setNewItem((prev) => ({ ...prev, folderName: '' }));
    } else if (!isCurrentQuickNotes && !newItem.folderName) {
      setNewItem((prev) => ({ ...prev, folderName: 'Semester 1' }));
    }
  }, [selectedPackId, isCurrentQuickNotes]);

  // Handle PDF Upload via Backend
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast('Please upload a valid PDF document', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', 'study_material');

    setUploadingPdf(true);
    setUploadProgress(0);

    try {
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      if (res.data.success) {
        const uploadedUrl = res.data.data?.url || res.data.url || '';
        setNewItem((prev) => ({
          ...prev,
          pdfUrl: uploadedUrl,
          title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
        }));
        showToast('PDF file uploaded successfully!', 'success');
      }
    } catch (err) {
      console.error('Upload failed', err);
      showToast(err.response?.data?.message || 'Failed to upload PDF file', 'error');
    } finally {
      setUploadingPdf(false);
      setUploadProgress(0);
    }
  };

  // Handle Cover Thumbnail Upload
  const handleCoverUpload = async (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP)', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'pharmacode_thumbnails');

    if (isEdit) setUploadingEditImage(true);
    else setUploadingImage(true);

    try {
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const url = res.data.data?.url || res.data.url;
        if (isEdit) {
          setEditModal((prev) => ({
            ...prev,
            pack: { ...prev.pack, thumbnail: url },
          }));
        } else {
          setNewPack((prev) => ({ ...prev, thumbnail: url }));
        }
        showToast('Cover image uploaded successfully!', 'success');
      }
    } catch (err) {
      console.error('Image upload failed', err);
      showToast(err.response?.data?.message || 'Failed to upload cover image', 'error');
    } finally {
      if (isEdit) setUploadingEditImage(false);
      else setUploadingImage(false);
    }
  };

  // Create Package
  const handleCreatePack = async (e) => {
    e.preventDefault();
    try {
      const isFree = Boolean(newPack.isFree || Number(newPack.discountPrice) === 0);
      const mrp = isFree ? 0 : Number(newPack.price || 0);
      const selling = isFree ? 0 : Number(newPack.discountPrice || 0);

      if (!isFree && selling > mrp) {
        showToast(`Selling price (₹${selling}) cannot be greater than MRP regular price (₹${mrp})`, 'warning');
        return;
      }

      const sanitizedHighlights = (newPack.highlights || []).filter(
        (h) => typeof h === 'string' && h.trim() !== ''
      );

      const res = await api.post('/admin/study-packs', {
        ...newPack,
        highlights: sanitizedHighlights,
        price: mrp,
        discountPrice: selling,
        isFree,
      });

      if (res.data.success) {
        showToast('Study Material Package created successfully!', 'success');
        setPacks((prev) => [res.data.data, ...prev]);
        setSelectedPackId(res.data.data._id);
        setNewPack({
          title: '',
          description: '',
          courseType: 'B.Pharm',
          scopeLabel: 'Semester 1-8',
          price: 999,
          discountPrice: 499,
          isFree: false,
          validityDays: 365,
          thumbnail: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80',
          highlights: ['All Semesters / Topics Covered', 'Comprehensive High-Yield Notes', 'Downloadable & Printable PDFs'],
        });
      }
    } catch (err) {
      console.error('Creation failed', err);
      showToast(err.response?.data?.message || 'Failed to create package', 'error');
    }
  };
  // Add Item to Package
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedPackId) {
      showToast('Please select a target package first', 'warning');
      return;
    }
    if (!newItem.pdfUrl) {
      showToast('Please upload or provide a PDF URL', 'warning');
      return;
    }

    try {
      const payload = {
        ...newItem,
        folderName: newItem.folderName.trim(),
        subjectName: isCurrentQuickNotes
          ? (newItem.subjectName?.trim() || newItem.folderName.trim())
          : (newItem.subjectName?.trim() || ''),
        chapterName: newItem.chapterName?.trim() || '',
      };

      const res = await api.post(`/admin/study-packs/${selectedPackId}/items`, payload);
      if (res.data.success) {
        showToast('PDF Item added to package successfully!', 'success');
        setPackItems((prev) => [...prev, res.data.data]);
        setNewItem((prev) => ({
          ...prev,
          title: '',
          pdfUrl: '',
          chapterName: '',
          pageCount: 0,
          isFreeDemo: false,
          folderName: isCurrentQuickNotes ? prev.folderName : 'Semester 1',
          subjectName: '',
        }));
        fetchPacks();
      }
    } catch (err) {
      console.error('Failed to add item', err);
      showToast(err.response?.data?.message || 'Failed to add item to package', 'error');
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this PDF from the package?')) return;
    try {
      const res = await api.delete(`/admin/study-pack-items/${itemId}`);
      if (res.data.success) {
        showToast('Item deleted successfully', 'success');
        setPackItems((prev) => prev.filter((it) => it._id !== itemId));
        fetchPacks();
      }
    } catch (err) {
      console.error('Delete item failed', err);
      showToast('Failed to delete item', 'error');
    }
  };

  // Delete Package
  const handleDeletePack = async (packId) => {
    if (!window.confirm('WARNING: This will delete this package and ALL contained PDF notes permanently. Continue?')) return;
    try {
      const res = await api.delete(`/admin/study-packs/${packId}`);
      if (res.data.success) {
        showToast('Package deleted successfully', 'success');
        const updated = packs.filter((p) => p._id !== packId);
        setPacks(updated);
        if (selectedPackId === packId) {
          setSelectedPackId(updated[0]?._id || '');
        }
      }
    } catch (err) {
      console.error('Delete pack failed', err);
      showToast('Failed to delete package', 'error');
    }
  };

  // Update Package (from Edit Modal)
  const handleUpdatePack = async (e) => {
    e.preventDefault();
    if (!editModal.pack) return;
    try {
      const isFree = Boolean(editModal.pack.isFree || Number(editModal.pack.discountPrice) === 0);
      const mrp = isFree ? 0 : Number(editModal.pack.price || 0);
      const selling = isFree ? 0 : Number(editModal.pack.discountPrice || 0);

      if (!isFree && selling > mrp) {
        showToast(`Selling price (₹${selling}) cannot be greater than MRP regular price (₹${mrp})`, 'warning');
        return;
      }

      const sanitizedHighlights = (editModal.pack.highlights || []).filter(
        (h) => typeof h === 'string' && h.trim() !== ''
      );

      const res = await api.put(`/admin/study-packs/${editModal.pack._id}`, {
        ...editModal.pack,
        highlights: sanitizedHighlights,
        price: mrp,
        discountPrice: selling,
        isFree,
      });

      if (res.data.success) {
        showToast('Package updated successfully!', 'success');
        setPacks((prev) => prev.map((p) => (p._id === editModal.pack._id ? res.data.data : p)));
        setEditModal({ isOpen: false, pack: null });
      }
    } catch (err) {
      console.error('Update failed', err);
      showToast(err.response?.data?.message || 'Failed to update package', 'error');
    }
  };

  const filteredPacks = packs.filter((p) => {
    if (!searchQuery.trim()) return true;
    return (
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.courseType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.scopeLabel?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-8">
      {/* 2-Column Management Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Create New Study Material Package */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Create Study Material Package</h3>
              <p className="text-xs text-slate-500">Add a new digital notes bundle or semester package</p>
            </div>
          </div>

          <form onSubmit={handleCreatePack} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Package Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Complete B.Pharm Study Material (Sem 1-8)"
                value={newPack.title}
                onChange={(e) => setNewPack({ ...newPack, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Type *</label>
                <select
                  value={newPack.courseType}
                  onChange={(e) => setNewPack({ ...newPack, courseType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                >
                  <option value="B.Pharm">🎓 B.Pharm</option>
                  <option value="D.Pharm">💊 D.Pharm</option>
                  <option value="QuickRevision">⚡ Quick Revision</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scope / Coverage Label</label>
                <input
                  type="text"
                  placeholder="e.g. Semesters 1-8, 1st Year, All Subjects"
                  value={newPack.scopeLabel}
                  onChange={(e) => setNewPack({ ...newPack, scopeLabel: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700">Package Pricing</span>
                <label className="inline-flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPack.isFree}
                    onChange={(e) => setNewPack({ ...newPack, isFree: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-emerald-700">100% Free Package</span>
                </label>
              </div>

              {!newPack.isFree && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">MRP Regular Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newPack.price}
                      onChange={(e) => setNewPack({ ...newPack, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Discounted Selling Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newPack.discountPrice}
                      onChange={(e) => setNewPack({ ...newPack, discountPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
              <textarea
                rows={3}
                required
                placeholder="Describe what subjects and notes are included in this bundle..."
                value={newPack.description}
                onChange={(e) => setNewPack({ ...newPack, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 text-xs">Package Thumbnail (Cover Image)</label>
              <div className="mt-1.5 flex items-center space-x-3">
                <input
                  type="file"
                  accept="image/*"
                  id="studyPackThumbnailUpload"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={(e) => handleCoverUpload(e, false)}
                />
                <label
                  htmlFor="studyPackThumbnailUpload"
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition flex items-center space-x-1.5"
                >
                  <span>📷 {uploadingImage ? 'Uploading...' : 'Upload Cover Image'}</span>
                </label>
                {newPack.thumbnail && (
                  <img
                    src={newPack.thumbnail}
                    alt="Thumbnail Preview"
                    className="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-sm"
                  />
                )}
              </div>
              <input
                type="text"
                placeholder="Or paste direct image URL (https://...)"
                value={newPack.thumbnail || ''}
                onChange={(e) => setNewPack({ ...newPack, thumbnail: e.target.value })}
                className="w-full mt-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Highlights (Green Tick Points) Manager */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 text-xs">Highlights (Green Tick Points)</label>
                <button
                  type="button"
                  onClick={() =>
                    setNewPack({
                      ...newPack,
                      highlights: [...(newPack.highlights || []), ''],
                    })
                  }
                  className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  + Add Point
                </button>
              </div>
              <div className="space-y-1.5">
                {(newPack.highlights || []).map((h, hIdx) => (
                  <div key={hIdx} className="flex items-center space-x-2">
                    <span className="text-emerald-600 font-bold text-xs">✓</span>
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => {
                        const updated = [...newPack.highlights];
                        updated[hIdx] = e.target.value;
                        setNewPack({ ...newPack, highlights: updated });
                      }}
                      placeholder={`e.g. Comprehensive notes (${hIdx + 1})`}
                      className="flex-grow p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = newPack.highlights.filter((_, idx) => idx !== hIdx);
                        setNewPack({ ...newPack, highlights: updated });
                      }}
                      className="text-slate-400 hover:text-red-500 font-bold text-sm px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notes Package</span>
            </button>
          </form>
        </div>
        {/* Right Column: Add PDF Document to Package */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Add PDF Document to Package</h3>
                <p className="text-xs text-slate-500">Upload notes organized by Semester & Subject</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Package *</label>
              <select
                value={selectedPackId}
                onChange={(e) => setSelectedPackId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-blue-50/50 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
              >
                {packs.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} ({p.courseType} • {p.scopeLabel})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-xs font-extrabold text-slate-700">Organization Hierarchy</span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Folder / Semester *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Semester 1, 1st Year, Pharmacology"
                    value={newItem.folderName}
                    onChange={(e) => setNewItem({ ...newItem, folderName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Subject Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pharmacognosy, Pharmaceutics"
                    value={newItem.subjectName}
                    onChange={(e) => setNewItem({ ...newItem, subjectName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Chapter / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ch-1: Crude Drugs"
                    value={newItem.chapterName}
                    onChange={(e) => setNewItem({ ...newItem, chapterName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PDF Document Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Pharmacognosy Chapter 1 Complete Notes"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">PDF File Upload or Direct URL *</label>

              <div className="flex items-center space-x-2">
                <label className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl cursor-pointer text-xs font-bold text-slate-600 transition">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>{uploadingPdf ? `Uploading (${uploadProgress}%)` : 'Choose PDF File'}</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    disabled={uploadingPdf}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadingPdf && (
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              <input
                type="text"
                placeholder="Or paste direct Cloudinary / Storage PDF URL"
                value={newItem.pdfUrl || ''}
                onChange={(e) => setNewItem({ ...newItem, pdfUrl: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:bg-white focus:outline-none"
              />

              {newItem.pdfUrl && (
                <div className="flex items-center space-x-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  <span className="text-emerald-600 font-bold">✓ PDF Ready:</span>
                  <span className="truncate max-w-[280px] font-mono text-emerald-800">{newItem.pdfUrl}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Page Count (Optional)</label>
                <input
                  type="number"
                  min="0"
                  value={newItem.pageCount}
                  onChange={(e) => setNewItem({ ...newItem, pageCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="pt-4">
                <label className="inline-flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItem.isFreeDemo}
                    onChange={(e) => setNewItem({ ...newItem, isFreeDemo: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-emerald-700">🟢 Free Demo (Unlocked for all)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploadingPdf}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add PDF to Package</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                PDFs in this Package ({packItems.length})
              </span>
            </div>

            {loadingItems ? (
              <p className="text-xs text-slate-400">Loading items...</p>
            ) : packItems.length === 0 ? (
              <p className="text-xs text-slate-400">No PDFs uploaded in this package yet.</p>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {packItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="truncate space-y-0.5">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-800 truncate">
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                          {item.folderName}
                        </span>
                        {item.subjectName && item.subjectName.toLowerCase() !== item.folderName?.toLowerCase() && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                            {item.subjectName}
                          </span>
                        )}
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.chapterName && (
                        <p className="text-[10px] text-slate-500">{item.chapterName}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {item.isFreeDemo && (
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Demo
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Table: Manage Existing Packages */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Manage Study Material Packages</h3>
            <p className="text-xs text-slate-500">Edit package pricing, view PDFs, or delete packages</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-extrabold text-[11px] uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Course & Scope</th>
                <th className="py-3 px-4">Pricing</th>
                <th className="py-3 px-4">PDFs</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPacks.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.thumbnail || '/placeholder-notes.jpg'}
                        alt={p.title}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                      />
                      <div>
                        <span className="font-extrabold text-slate-900 block truncate max-w-xs sm:max-w-md">
                          {p.title}
                        </span>
                        <span className="text-[11px] text-slate-400">/{p.slug}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold text-[10px] mr-1">
                      {p.courseType}
                    </span>
                    <span className="text-slate-600 font-medium">{p.scopeLabel}</span>
                  </td>

                  <td className="py-3 px-4">
                    {p.isFree ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      <div className="space-x-1">
                        <span className="font-bold text-slate-900">₹{p.discountPrice}</span>
                        {p.price > p.discountPrice && (
                          <span className="text-slate-400 line-through text-[11px]">₹{p.price}</span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-700">{p.totalPdfs || 0}</td>

                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() =>
                        setEditModal({
                          isOpen: true,
                          pack: {
                            ...p,
                            highlights: Array.isArray(p.highlights) ? [...p.highlights] : [],
                          },
                        })
                      }
                      className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition cursor-pointer"
                      title="Edit Package"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeletePack(p._id)}
                      className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition cursor-pointer"
                      title="Delete Package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Package Modal */}
      {editModal.isOpen && editModal.pack && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-900">Edit Study Material Package</h3>

            <form onSubmit={handleUpdatePack} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editModal.pack.title}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      pack: { ...editModal.pack, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course Type *</label>
                  <select
                    value={editModal.pack.courseType}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        pack: { ...editModal.pack, courseType: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="B.Pharm">B.Pharm</option>
                    <option value="D.Pharm">D.Pharm</option>
                    <option value="QuickRevision">Quick Revision</option>
                    <option value="Mixed">Special Bundle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scope Label</label>
                  <input
                    type="text"
                    value={editModal.pack.scopeLabel || ''}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        pack: { ...editModal.pack, scopeLabel: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="inline-flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editModal.pack.isFree}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        pack: { ...editModal.pack, isFree: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs font-bold text-emerald-700">100% Free Package</span>
                </label>

                {!editModal.pack.isFree && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">MRP Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={editModal.pack.price}
                        onChange={(e) =>
                          setEditModal({
                            ...editModal,
                            pack: { ...editModal.pack, price: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={editModal.pack.discountPrice}
                        onChange={(e) =>
                          setEditModal({
                            ...editModal,
                            pack: { ...editModal.pack, discountPrice: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editModal.pack.description}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      pack: { ...editModal.pack, description: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 text-xs">Package Thumbnail (Cover Image)</label>
                <div className="mt-1.5 flex items-center space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    id="editStudyPackThumbnailUpload"
                    className="hidden"
                    disabled={uploadingEditImage}
                    onChange={(e) => handleCoverUpload(e, true)}
                  />
                  <label
                    htmlFor="editStudyPackThumbnailUpload"
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition flex items-center space-x-1.5"
                  >
                    <span>📷 {uploadingEditImage ? 'Uploading...' : 'Upload Cover Image'}</span>
                  </label>
                  {editModal.pack.thumbnail && (
                    <img
                      src={editModal.pack.thumbnail}
                      alt="Thumbnail Preview"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-sm"
                    />
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Or paste direct image URL (https://...)"
                  value={editModal.pack.thumbnail || ''}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      pack: { ...editModal.pack, thumbnail: e.target.value },
                    })
                  }
                  className="w-full mt-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Highlights (Green Tick Points) Manager in Edit Modal */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs">Highlights (Green Tick Points)</label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditModal({
                        ...editModal,
                        pack: {
                          ...editModal.pack,
                          highlights: [...(editModal.pack.highlights || []), ''],
                        },
                      })
                    }
                    className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    + Add Point
                  </button>
                </div>
                <div className="space-y-1.5">
                  {(editModal.pack.highlights || []).map((h, hIdx) => (
                    <div key={hIdx} className="flex items-center space-x-2">
                      <span className="text-emerald-600 font-bold text-xs">✓</span>
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const updated = [...(editModal.pack.highlights || [])];
                          updated[hIdx] = e.target.value;
                          setEditModal({
                            ...editModal,
                            pack: { ...editModal.pack, highlights: updated },
                          });
                        }}
                        placeholder={`Highlight point ${hIdx + 1}...`}
                        className="flex-grow p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editModal.pack.highlights || []).filter(
                            (_, idx) => idx !== hIdx
                          );
                          setEditModal({
                            ...editModal,
                            pack: { ...editModal.pack, highlights: updated },
                          });
                        }}
                        className="text-slate-400 hover:text-red-500 font-bold text-sm px-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, pack: null })}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudyPackTab;
