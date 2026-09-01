import React, { useState } from 'react';
import { Search } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

const AdminStudentsTab = ({ students }) => {
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);

  const filteredStudents = students.filter(st =>
    !studentSearch ||
    st.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    st.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    st.mobile?.includes(studentSearch)
  );
  const paginatedStudents = filteredStudents.slice((studentPage - 1) * ITEMS_PER_PAGE, studentPage * ITEMS_PER_PAGE);
  const totalStudentPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-base">Registered Students ({filteredStudents.length})</h3>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={studentSearch}
            onChange={e => {
              setStudentSearch(e.target.value);
              setStudentPage(1);
            }}
            placeholder="Search student by name, email, mobile..."
            className="pl-8 pr-3 py-1.5 border rounded-xl text-xs bg-slate-50 focus:bg-white w-72"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {paginatedStudents.map(st => (
          <div key={st._id} className="p-4 bg-slate-50 border rounded-2xl space-y-1">
            <span className="font-extrabold text-slate-900 text-sm block">{st.name}</span>
            <span className="text-xs text-slate-500 block">{st.email}</span>
            <span className="text-xs text-slate-400 block">{st.mobile || '—'}</span>
          </div>
        ))}
        {filteredStudents.length === 0 && (
          <div className="col-span-3 text-center py-6 text-slate-400 italic">
            No students match your query.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalStudentPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
          <div>
            Showing {Math.min((studentPage - 1) * ITEMS_PER_PAGE + 1, filteredStudents.length)} to{' '}
            {Math.min(studentPage * ITEMS_PER_PAGE, filteredStudents.length)} of {filteredStudents.length} items
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              disabled={studentPage === 1}
              onClick={() => setStudentPage(studentPage - 1)}
              className={`px-3 py-1.5 rounded-lg border transition ${
                studentPage === 1 ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 cursor-pointer'
              }`}
            >
              ← Prev
            </button>
            <span className="px-2">
              Page {studentPage} of {totalStudentPages}
            </span>
            <button
              type="button"
              disabled={studentPage >= totalStudentPages}
              onClick={() => setStudentPage(studentPage + 1)}
              className={`px-3 py-1.5 rounded-lg border transition ${
                studentPage >= totalStudentPages ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 cursor-pointer'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsTab;
