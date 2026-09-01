import React, { useState } from 'react';
import { Search, Edit3, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { PCI_CURRICULUM, QUICK_REVISION_SUBJECTS } from '../../pages/StudyMaterials';

const ITEMS_PER_PAGE = 8;

const bPharmOptions = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

const dPharmOptions = ['1st Year', '2nd Year'];

const AdminMaterialsTab = ({
  materialsList,
  fetchAdminData,
  setEditModal,
  showToast,
  handleFileUpload,
  uploadingFile,
}) => {
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    courseType: 'B.Pharm',
    semesterOrYear: 'Semester 1',
    subject: 'Human Anatomy and Physiology I',
    customSubject: '',
    chapter: '',
    materialType: 'chapter_notes',
    description: '',
    fileUrl: '',
    isCustomExam: false,
    customExamName: '',
  });

  const [materialsSearch, setMaterialsSearch] = useState('');
  const [materialsPage, setMaterialsPage] = useState(1);

  const standardSubjects =
    PCI_CURRICULUM[newMaterial.courseType]?.[newMaterial.semesterOrYear] || [];

  const handleCreateMaterial = async e => {
    e.preventDefault();
    try {
      const finalSemesterOrYear =
        newMaterial.courseType === 'Exam' && newMaterial.isCustomExam
          ? newMaterial.customExamName
          : newMaterial.semesterOrYear;

      const finalSubject =
        newMaterial.subject === 'CUSTOM'
          ? newMaterial.customSubject
          : newMaterial.subject;

      if (!finalSemesterOrYear) {
        showToast('Please specify the semester, year, or exam name', 'warning');
        return;
      }

      if (!finalSubject) {
        showToast('Please specify the subject', 'warning');
        return;
      }

      const slug =
        newMaterial.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') +
        '-' + Date.now();

      const res = await api.post('/admin/materials', {
        ...newMaterial,
        description: newMaterial.description || newMaterial.title || 'Pharmacy Study Notes and PYQ Paper',
        semesterOrYear: finalSemesterOrYear,
        subject: finalSubject,
        slug,
      });

      if (res.data.success) {
        showToast('Study Material uploaded successfully!', 'success');
        setNewMaterial({
          ...newMaterial,
          title: '',
          chapter: '',
          fileUrl: '',
          customSubject: '',
          customExamName: '',
        });
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDeleteMaterial = async id => {
    if (!window.confirm('Are you sure you want to delete this study material?')) return;
    try {
      const res = await api.delete(`/admin/materials/${id}`);
      if (res.data.success) {
        showToast('Study Material deleted successfully!', 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to delete: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const filteredMaterials = materialsList.filter(m =>
    !materialsSearch ||
    m.title?.toLowerCase().includes(materialsSearch.toLowerCase()) ||
    m.courseType?.toLowerCase().includes(materialsSearch.toLowerCase()) ||
    m.subject?.toLowerCase().includes(materialsSearch.toLowerCase())
  );
  const paginatedMaterials = filteredMaterials.slice((materialsPage - 1) * ITEMS_PER_PAGE, materialsPage * ITEMS_PER_PAGE);
  const totalMaterialPages = Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE) || 1;

  return (
    <div className="space-y-8">
      {/* ── Upload Form ── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">
            Upload Notes & PYQs (Course ➔ Semester ➔ Subject ➔ Notes/PYQs)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Select Course ➔ Semester/Year/Exam ➔ Subject ➔ Material Type (Chapter Notes or PYQ Paper) ➔ Upload PDF
          </p>
        </div>

        <form onSubmit={handleCreateMaterial} className="space-y-4 text-xs sm:text-sm">
          {/* Step 1 & 2: Course & Semester/Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700">1. Course / Category</label>
              <select
                value={newMaterial.courseType}
                onChange={e => {
                  const c = e.target.value;
                  let initialSem = 'Semester 1';
                  let initialSub = 'Human Anatomy and Physiology I';
                  if (c === 'D.Pharm') {
                    initialSem = '1st Year';
                    initialSub = 'Pharmaceutics';
                  } else if (c === 'QuickRevision') {
                    initialSem = 'All Subjects';
                    initialSub = QUICK_REVISION_SUBJECTS[0];
                  }
                  setNewMaterial({
                    ...newMaterial,
                    courseType: c,
                    semesterOrYear: initialSem,
                    subject: initialSub,
                    isCustomExam: false,
                    customExamName: '',
                  });
                }}
                className="w-full mt-1 p-2.5 border rounded-xl font-bold bg-slate-50"
              >
                <option value="B.Pharm">🎓 B.Pharm (8 Semesters)</option>
                <option value="D.Pharm">💊 Diploma (1st & 2nd Year)</option>
                <option value="QuickRevision">⚡ Quick Revision Notes (All Subjects)</option>
              </select>
            </div>

            {/* Semester / Year Selector */}
            <div>
              <label className="font-bold text-slate-700">
                {newMaterial.courseType === 'B.Pharm'
                  ? '2. Semester'
                  : newMaterial.courseType === 'D.Pharm'
                  ? '2. Year'
                  : '2. Section'}
              </label>

              <select
                value={newMaterial.semesterOrYear}
                onChange={e => {
                  const sem = e.target.value;
                  const initialSub =
                    newMaterial.courseType === 'QuickRevision'
                      ? QUICK_REVISION_SUBJECTS[0]
                      : PCI_CURRICULUM[newMaterial.courseType]?.[sem]?.[0] || newMaterial.subject;
                  setNewMaterial({
                    ...newMaterial,
                    semesterOrYear: sem,
                    subject: initialSub,
                  });
                }}
                className="w-full mt-1 p-2.5 border rounded-xl font-bold bg-blue-50 text-blue-900"
              >
                {newMaterial.courseType === 'B.Pharm' &&
                  bPharmOptions.map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                {newMaterial.courseType === 'D.Pharm' &&
                  dPharmOptions.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                {newMaterial.courseType === 'QuickRevision' && (
                  <option value="All Subjects">⚡ Pharmacist Exam Quick Revision</option>
                )}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700">3. Material Type</label>
              <select
                value={newMaterial.materialType}
                onChange={e => setNewMaterial({ ...newMaterial, materialType: e.target.value })}
                className="w-full mt-1 p-2.5 border rounded-xl font-bold"
              >
                <option value="chapter_notes">📄 Chapter / Revision Notes PDF</option>
                {newMaterial.courseType !== 'QuickRevision' && (
                  <option value="pyq_paper">📑 University / Board PYQ Paper</option>
                )}
              </select>
            </div>
          </div>

          {/* Step 3: Subject & Chapter/Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700">4. Subject</label>
              {standardSubjects.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={newMaterial.subject}
                    onChange={e => setNewMaterial({ ...newMaterial, subject: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl font-bold"
                  >
                    {standardSubjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="CUSTOM">➕ Other / Custom Subject Name...</option>
                  </select>

                  {newMaterial.subject === 'CUSTOM' && (
                    <input
                      type="text"
                      required
                      value={newMaterial.customSubject}
                      onChange={e => setNewMaterial({ ...newMaterial, customSubject: e.target.value })}
                      placeholder="Type custom subject name..."
                      className="w-full p-2.5 border rounded-xl font-bold bg-amber-50"
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  required
                  value={newMaterial.subject}
                  onChange={e => setNewMaterial({ ...newMaterial, subject: e.target.value })}
                  placeholder="e.g. Pharmacology, Pharmaceutics, Clinical Pharmacy"
                  className="w-full mt-1 p-2.5 border rounded-xl font-bold"
                />
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700">
                {newMaterial.materialType === 'chapter_notes' ? '5. Chapter Name / Number' : '5. Exam Year / Paper Details'}
              </label>
              <input
                type="text"
                value={newMaterial.chapter}
                onChange={e => setNewMaterial({ ...newMaterial, chapter: e.target.value })}
                placeholder={newMaterial.materialType === 'chapter_notes' ? 'e.g. Chapter 1: Dosage Forms & Posology' : 'e.g. 2024 End-Semester Solved Question Paper'}
                className="w-full mt-1 p-2.5 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700">Document Title</label>
            <input
              type="text"
              required
              value={newMaterial.title}
              onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })}
              placeholder="e.g. Pharmaceutics-I Complete Handwritten Notes PDF"
              className="w-full mt-1 p-2.5 border rounded-xl font-bold"
            />
          </div>

          {/* Upload PDF */}
          <div className="p-4 bg-slate-50 border rounded-2xl space-y-2">
            <label className="font-bold text-slate-700 block">PDF Document (Cloudinary Upload)</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".pdf"
                onChange={e => handleFileUpload(e, url => setNewMaterial({ ...newMaterial, fileUrl: url }))}
                className="text-xs"
              />
              {uploadingFile && <span className="text-xs text-blue-600 font-bold animate-pulse">Uploading to Cloudinary...</span>}
            </div>
            <input
              type="text"
              required
              value={newMaterial.fileUrl}
              onChange={e => setNewMaterial({ ...newMaterial, fileUrl: e.target.value })}
              placeholder="Or paste direct PDF URL..."
              className="w-full p-2 border rounded-xl text-xs font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition cursor-pointer"
          >
            Upload Study Material PDF
          </button>
        </form>
      </div>

      {/* ── Manage Materials Table ── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h4 className="font-extrabold text-slate-900 text-base">
            Manage Uploaded Study Materials ({filteredMaterials.length})
          </h4>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={materialsSearch}
              onChange={e => {
                setMaterialsSearch(e.target.value);
                setMaterialsPage(1);
              }}
              placeholder="Search materials by title or subject..."
              className="pl-8 pr-3 py-1.5 border rounded-xl text-xs bg-slate-50 focus:bg-white w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b">
              <tr>
                <th className="p-3">Course</th>
                <th className="p-3">Sem / Year / Exam</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Title</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMaterials.map(m => (
                <tr key={m._id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3 font-bold text-blue-700">{m.courseType}</td>
                  <td className="p-3 font-semibold">{m.semesterOrYear}</td>
                  <td className="p-3">{m.subject}</td>
                  <td className="p-3 font-bold text-slate-900 max-w-xs truncate">{m.title}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {m.materialType === 'chapter_notes' ? 'Notes' : 'PYQ'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setEditModal({ open: true, type: 'material', data: { ...m } })}
                      className="px-2 py-1 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition inline-flex items-center space-x-1 font-bold cursor-pointer"
                      title="Edit Study Material"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMaterial(m._id)}
                      className="px-2 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition inline-flex items-center space-x-1 font-bold cursor-pointer"
                      title="Delete PDF"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400 italic">
                    No study materials match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalMaterialPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
            <div>
              Showing {Math.min((materialsPage - 1) * ITEMS_PER_PAGE + 1, filteredMaterials.length)} to{' '}
              {Math.min(materialsPage * ITEMS_PER_PAGE, filteredMaterials.length)} of {filteredMaterials.length} items
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                disabled={materialsPage === 1}
                onClick={() => setMaterialsPage(materialsPage - 1)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  materialsPage === 1 ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 cursor-pointer'
                }`}
              >
                ← Prev
              </button>
              <span className="px-2">
                Page {materialsPage} of {totalMaterialPages}
              </span>
              <button
                type="button"
                disabled={materialsPage >= totalMaterialPages}
                onClick={() => setMaterialsPage(materialsPage + 1)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  materialsPage >= totalMaterialPages ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 cursor-pointer'
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

export default AdminMaterialsTab;
