import React from 'react';

const AdminStatsTab = ({ stats, setActiveTab }) => {
  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* ── ROW 1: Hero KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: '👥', color: 'blue', sub: `+${stats.registrationTrend?.slice(-1)?.[0]?.count || 0} today` },
          { label: 'Total Revenue', value: `₹${stats.totalRevenue?.toLocaleString('en-IN')}`, icon: '💰', color: 'emerald', sub: `${stats.totalOrders} completed orders` },
          { label: 'CBT Attempts', value: stats.totalAttempts, icon: '📝', color: 'violet', sub: `+${stats.attemptsTrend?.slice(-1)?.[0]?.count || 0} today` },
          { label: 'Content Items', value: (stats.contentInventory?.folderItems || 0) + (stats.contentInventory?.studyMaterials || 0) + (stats.contentInventory?.singleModelPapers || 0) + (stats.contentInventory?.nonPharmaResources || 0), icon: '📦', color: 'amber', sub: `${stats.totalSeries} series packs` },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                <div className={`text-2xl sm:text-3xl font-extrabold mt-1 text-${kpi.color}-600`}>{kpi.value}</div>
                <span className="text-[10px] font-semibold text-slate-500 mt-1 block">{kpi.sub}</span>
              </div>
              <span className="text-2xl">{kpi.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW 2: 7-Day Interactive Graph Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Trend Graph */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-sm">
                📈
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">New Registrations</h4>
                <p className="text-[10px] text-slate-400 font-semibold">Last 7 Days Trend</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-xl">
              {stats.registrationTrend?.reduce((s, d) => s + d.count, 0) || 0} total
            </span>
          </div>

          {/* Bar Chart Area */}
          <div className="pt-2">
            <div className="flex items-end justify-between gap-2 h-32 px-2 pb-2 bg-slate-50/80 rounded-2xl border border-slate-100">
              {(stats.registrationTrend || []).map((d, i) => {
                const maxVal = Math.max(...(stats.registrationTrend || []).map(x => x.count), 1);
                const pct = d.count > 0 ? Math.max((d.count / maxVal) * 85, 20) : 4;
                return (
                  <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                    <span className={`text-[10px] font-extrabold mb-1 transition ${
                      d.count > 0 ? 'text-blue-600 font-bold' : 'text-slate-300'
                    }`}>
                      {d.count}
                    </span>
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                        d.count > 0
                          ? 'bg-gradient-to-t from-blue-600 to-indigo-400 shadow-sm group-hover:from-blue-700 group-hover:to-indigo-500'
                          : 'bg-slate-200'
                      }`}
                      style={{ height: `${pct}%` }}
                      title={`${d.label}: ${d.count} registrations`}
                    />
                    <span className="text-[10px] text-slate-500 font-semibold mt-1.5 whitespace-nowrap">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Revenue Trend Graph */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-sm">
                💰
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Daily Revenue</h4>
                <p className="text-[10px] text-slate-400 font-semibold">Last 7 Days (₹)</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-xl">
              ₹{stats.revenueTrend?.reduce((s, d) => s + d.amount, 0)?.toLocaleString('en-IN') || 0}
            </span>
          </div>

          {/* Bar Chart Area */}
          <div className="pt-2">
            <div className="flex items-end justify-between gap-2 h-32 px-2 pb-2 bg-slate-50/80 rounded-2xl border border-slate-100">
              {(stats.revenueTrend || []).map((d, i) => {
                const maxVal = Math.max(...(stats.revenueTrend || []).map(x => x.amount), 1);
                const pct = d.amount > 0 ? Math.max((d.amount / maxVal) * 85, 20) : 4;
                return (
                  <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                    <span className={`text-[10px] font-extrabold mb-1 transition truncate max-w-full ${
                      d.amount > 0 ? 'text-emerald-600 font-bold' : 'text-slate-300'
                    }`}>
                      {d.amount > 0 ? `₹${d.amount}` : '0'}
                    </span>
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                        d.amount > 0
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-sm group-hover:from-emerald-700 group-hover:to-teal-500'
                          : 'bg-slate-200'
                      }`}
                      style={{ height: `${pct}%` }}
                      title={`${d.label}: ₹${d.amount}`}
                    />
                    <span className="text-[10px] text-slate-500 font-semibold mt-1.5 whitespace-nowrap">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CBT Attempts Trend Graph */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-extrabold text-sm">
                📝
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">CBT Attempts</h4>
                <p className="text-[10px] text-slate-400 font-semibold">Last 7 Days Submissions</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-violet-700 bg-violet-50 border border-violet-200/60 px-2.5 py-1 rounded-xl">
              {stats.attemptsTrend?.reduce((s, d) => s + d.count, 0) || 0} tests
            </span>
          </div>

          {/* Bar Chart Area */}
          <div className="pt-2">
            <div className="flex items-end justify-between gap-2 h-32 px-2 pb-2 bg-slate-50/80 rounded-2xl border border-slate-100">
              {(stats.attemptsTrend || []).map((d, i) => {
                const maxVal = Math.max(...(stats.attemptsTrend || []).map(x => x.count), 1);
                const pct = d.count > 0 ? Math.max((d.count / maxVal) * 85, 20) : 4;
                return (
                  <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                    <span className={`text-[10px] font-extrabold mb-1 transition ${
                      d.count > 0 ? 'text-violet-600 font-bold' : 'text-slate-300'
                    }`}>
                      {d.count}
                    </span>
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                        d.count > 0
                          ? 'bg-gradient-to-t from-violet-600 to-purple-400 shadow-sm group-hover:from-violet-700 group-hover:to-purple-500'
                          : 'bg-slate-200'
                      }`}
                      style={{ height: `${pct}%` }}
                      title={`${d.label}: ${d.count} tests taken`}
                    />
                    <span className="text-[10px] text-slate-500 font-semibold mt-1.5 whitespace-nowrap">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Recent Users + Content Inventory ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Users */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-800">👥 Recently Joined Students</h4>
            <button onClick={() => setActiveTab('students')} className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                <tr>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">Email</th>
                  <th className="p-2.5">Mobile</th>
                  <th className="p-2.5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(stats.latestUsers || []).map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900 flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-[10px] flex-shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="p-2.5 text-slate-600">{u.email}</td>
                    <td className="p-2.5 font-mono text-slate-500">{u.mobile || '—'}</td>
                    <td className="p-2.5 text-slate-400 font-semibold">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Content Inventory Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-extrabold text-slate-800">📦 Content Inventory</h4>
            <div className="space-y-3">
              {[
                { label: 'Test Series Packs', count: stats.contentInventory?.testSeriesPacks || 0, color: 'bg-indigo-500', emoji: '📁' },
                { label: '4-Folder Items', count: stats.contentInventory?.folderItems || 0, color: 'bg-blue-500', emoji: '📄' },
                { label: 'Study Materials', count: stats.contentInventory?.studyMaterials || 0, color: 'bg-emerald-500', emoji: '🎓' },
                { label: 'Model Papers', count: stats.contentInventory?.singleModelPapers || 0, color: 'bg-amber-500', emoji: '🎯' },
                { label: 'Non-Pharma Quizzes', count: stats.contentInventory?.nonPharmaResources || 0, color: 'bg-violet-500', emoji: '🧠' },
                { label: 'CBT Test Papers', count: stats.contentInventory?.totalCBTPapers || 0, color: 'bg-rose-500', emoji: '📝' },
              ].map((item, i) => {
                const totalContent =
                  (stats.contentInventory?.testSeriesPacks || 0) +
                  (stats.contentInventory?.folderItems || 0) +
                  (stats.contentInventory?.studyMaterials || 0) +
                  (stats.contentInventory?.singleModelPapers || 0) +
                  (stats.contentInventory?.nonPharmaResources || 0) +
                  (stats.contentInventory?.totalCBTPapers || 0);
                const pct = totalContent ? Math.round((item.count / totalContent) * 100) : 0;
                return (
                  <div key={i} className="flex items-center space-x-3">
                    <span className="text-base">{item.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-700">{item.label}</span>
                        <span className="text-[11px] font-extrabold text-slate-900">{item.count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full">
                        <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Study Material Breakdown Mini */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-sm font-extrabold text-slate-800">🎓 Study Notes Breakdown</h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'B.Pharm', count: stats.studyBreakdown?.bPharmCount || 0, color: 'bg-blue-100 text-blue-700' },
                { label: 'D.Pharm', count: stats.studyBreakdown?.dPharmCount || 0, color: 'bg-emerald-100 text-emerald-700' },
                { label: 'Exam Notes', count: stats.studyBreakdown?.examNotesCount || 0, color: 'bg-amber-100 text-amber-700' },
              ].map((b, i) => (
                <div key={i} className={`rounded-xl p-3 text-center ${b.color}`}>
                  <div className="text-xl font-extrabold">{b.count}</div>
                  <div className="text-[10px] font-bold mt-0.5">{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 4: Top Series + Recent Orders + Recent Attempts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Performing Test Series */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-sm font-extrabold text-slate-800">🏆 Top Test Series Packs</h4>
          <div className="space-y-3">
            {(stats.topSeries || []).map((s, idx) => (
              <div key={s._id} className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-xl">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold text-white ${
                  idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-700' : 'bg-slate-300'
                }`}>
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-slate-900 truncate">{s.title}</p>
                  <p className="text-[10px] text-slate-500">{s.examType} • ₹{s.discountPrice || s.price}</p>
                </div>
                <span className="text-xs font-extrabold text-blue-600">{s.enrolledCount || 0} enrolled</span>
              </div>
            ))}
            {(!stats.topSeries || stats.topSeries.length === 0) && (
              <p className="text-xs text-slate-400 text-center py-4">No test series created yet.</p>
            )}
          </div>
        </div>

        {/* Recent Orders Feed */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-800">💳 Recent Orders</h4>
            <button onClick={() => setActiveTab('orders')} className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">
              View All →
            </button>
          </div>
          <div className="space-y-2">
            {(stats.recentOrders || []).map(o => (
              <div key={o._id} className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl text-xs">
                <div>
                  <p className="font-bold text-slate-800">{o.userId?.name || 'Student'}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{o.orderId?.slice(0, 12) || '...'}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-emerald-600">₹{o.totalAmount}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    o.paymentStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {o.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
            {(!stats.recentOrders || stats.recentOrders.length === 0) && (
              <p className="text-xs text-slate-400 text-center py-4">No orders yet.</p>
            )}
          </div>
        </div>

        {/* Recent CBT Attempts */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-sm font-extrabold text-slate-800">📝 Latest CBT Attempts</h4>
          <div className="space-y-2">
            {(stats.recentAttempts || []).map(a => (
              <div key={a._id} className="p-2.5 bg-slate-50/70 rounded-xl text-xs space-y-0.5">
                <p className="font-bold text-slate-800">{a.userId?.name || 'Student'}</p>
                <p className="text-[10px] text-blue-600 font-semibold truncate">{a.testPaperId?.title || a.testSeriesId?.title || 'CBT Test'}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] font-bold text-emerald-600">
                    {a.score !== undefined ? `${a.score}/${a.totalMarks || '—'}` : '—'}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {a.completedAt ? new Date(a.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                  </span>
                </div>
              </div>
            ))}
            {(!stats.recentAttempts || stats.recentAttempts.length === 0) && (
              <p className="text-xs text-slate-400 text-center py-4">No attempts yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 5: Quick Action Secondary KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Admins', value: stats.totalAdmins || 1, emoji: '🛡️', bg: 'bg-slate-100' },
          { label: 'CBT Papers', value: stats.totalPapers, emoji: '📋', bg: 'bg-blue-50' },
          { label: 'Coupons', value: stats.totalCoupons || 0, emoji: '🏷️', bg: 'bg-violet-50' },
          { label: 'Paid Orders', value: stats.totalOrders, emoji: '✅', bg: 'bg-emerald-50' },
          { label: 'Series Packs', value: stats.totalSeries, emoji: '📁', bg: 'bg-indigo-50' },
          { label: 'Study PDFs', value: stats.contentInventory?.studyMaterials || 0, emoji: '📚', bg: 'bg-amber-50' },
        ].map((kpi, i) => (
          <div key={i} className={`${kpi.bg} p-4 rounded-2xl text-center`}>
            <span className="text-xl">{kpi.emoji}</span>
            <div className="text-lg font-extrabold text-slate-900 mt-1">{kpi.value}</div>
            <div className="text-[10px] font-bold text-slate-500 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminStatsTab;
