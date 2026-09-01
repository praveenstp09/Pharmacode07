import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../../services/api';

const AdminContactsTab = ({
  contactsList,
  setContactsList,
  fetchAdminData,
  showToast,
}) => {
  const [contactFilter, setContactFilter] = useState('all'); // 'all', 'pending', 'resolved'

  const handleToggleResolve = async (contactId) => {
    try {
      const res = await api.put(`/admin/contacts/${contactId}/resolve`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setContactsList(prev =>
          prev.map(c => (c._id === contactId ? res.data.data : c))
        );
        return;
      }
    } catch (err) {
      try {
        const fallbackRes = await api.put(`/contact/${contactId}/resolve`);
        if (fallbackRes.data.success) {
          showToast(fallbackRes.data.message, 'success');
          setContactsList(prev =>
            prev.map(c => (c._id === contactId ? fallbackRes.data.data : c))
          );
          return;
        }
      } catch (fErr) {
        showToast('Failed to update inquiry status: ' + (err.response?.data?.message || err.message), 'error');
      }
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this student inquiry?')) return;
    try {
      const res = await api.delete(`/admin/contacts/${contactId}`);
      if (res.data.success) {
        showToast('Inquiry deleted successfully', 'info');
        setContactsList(prev => prev.filter(c => c._id !== contactId));
        return;
      }
    } catch (err) {
      try {
        const fDel = await api.delete(`/contact/${contactId}`);
        if (fDel.data.success) {
          showToast('Inquiry deleted successfully', 'info');
          setContactsList(prev => prev.filter(c => c._id !== contactId));
          return;
        }
      } catch (fErr) {
        showToast('Failed to delete inquiry: ' + (err.response?.data?.message || err.message), 'error');
      }
    }
  };

  const filteredContacts = contactsList.filter(c => {
    if (contactFilter === 'pending') return !c.isResolved;
    if (contactFilter === 'resolved') return c.isResolved;
    return true;
  });

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">
            Student Inquiries & Doubts ({contactsList.length})
          </h3>
          <p className="text-xs text-slate-500">
            Messages and doubt submissions sent from the "Contact Admin" section on the Home page and /contact page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl transition self-start sm:self-auto cursor-pointer"
          >
            🔄 Refresh Inquiries
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 text-xs font-bold">
        <button
          onClick={() => setContactFilter('all')}
          className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
            contactFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({contactsList.length})
        </button>
        <button
          onClick={() => setContactFilter('pending')}
          className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
            contactFilter === 'pending'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          🟡 Pending ({contactsList.filter(c => !c.isResolved).length})
        </button>
        <button
          onClick={() => setContactFilter('resolved')}
          className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
            contactFilter === 'resolved'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          🟢 Resolved ({contactsList.filter(c => c.isResolved).length})
        </button>
      </div>

      {contactsList.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <span className="text-3xl">📭</span>
          <p className="text-sm font-semibold">No student inquiries received yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContacts.map(c => (
            <div
              key={c._id}
              className={`p-5 rounded-2xl border transition space-y-3 ${
                c.isResolved
                  ? 'bg-slate-50/70 border-slate-200 opacity-90'
                  : 'bg-white border-amber-200/80 shadow-sm hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{c.name}</span>
                    {c.isResolved ? (
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        ✓ Resolved
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Pending Action
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    {c.subject || 'General Inquiry'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                  {new Date(c.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="p-3 bg-white border border-slate-100 rounded-xl text-xs text-slate-700 leading-relaxed shadow-inner">
                <p className="whitespace-pre-wrap font-medium">{c.message}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <div className="flex items-center gap-3 text-slate-600">
                  <a
                    href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject || 'Inquiry')}`}
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    ✉️ {c.email}
                  </a>
                  {c.mobile && (
                    <a
                      href={`tel:${c.mobile}`}
                      className="font-medium text-slate-500 hover:text-slate-900"
                    >
                      📞 {c.mobile}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleResolve(c._id)}
                    className={`px-2.5 py-1 font-bold text-xs rounded-lg transition cursor-pointer ${
                      c.isResolved
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                    title={c.isResolved ? 'Mark as Unresolved / Pending' : 'Mark as Resolved'}
                  >
                    {c.isResolved ? '↺ Reopen' : '✓ Mark Resolved'}
                  </button>

                  <a
                    href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject || 'Inquiry - PharmaCode07')}&body=Dear ${encodeURIComponent(c.name)},\n\nThank you for reaching out to PharmaCode07 regarding "${encodeURIComponent(c.subject || 'your inquiry')}".\n\n`}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
                  >
                    Reply ↗
                  </a>

                  <button
                    onClick={() => handleDeleteContact(c._id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContactsTab;
