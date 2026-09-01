import React, { useState } from 'react';
import { Search } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

const AdminOrdersTab = ({ orders }) => {
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);

  const filteredOrders = orders.filter(o =>
    !orderSearch ||
    o.orderId?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.userId?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.userId?.email?.toLowerCase().includes(orderSearch.toLowerCase())
  );
  const paginatedOrders = filteredOrders.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE);
  const totalOrderPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-base">Orders Log ({filteredOrders.length})</h3>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={orderSearch}
            onChange={e => {
              setOrderSearch(e.target.value);
              setOrderPage(1);
            }}
            placeholder="Search by Order ID or Student..."
            className="pl-8 pr-3 py-1.5 border rounded-xl text-xs bg-slate-50 focus:bg-white w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Student</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedOrders.map(o => (
              <tr key={o._id}>
                <td className="p-3 font-mono font-bold text-slate-800">{o.orderId}</td>
                <td className="p-3 font-semibold">{o.userId?.name || 'Student'}</td>
                <td className="p-3 font-bold text-emerald-600">₹{o.totalAmount}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    {o.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-slate-400 italic">
                  No orders match your query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalOrderPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
          <div>
            Showing {Math.min((orderPage - 1) * ITEMS_PER_PAGE + 1, filteredOrders.length)} to{' '}
            {Math.min(orderPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} items
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              disabled={orderPage === 1}
              onClick={() => setOrderPage(orderPage - 1)}
              className={`px-3 py-1.5 rounded-lg border transition ${
                orderPage === 1 ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 cursor-pointer'
              }`}
            >
              ← Prev
            </button>
            <span className="px-2">
              Page {orderPage} of {totalOrderPages}
            </span>
            <button
              type="button"
              disabled={orderPage >= totalOrderPages}
              onClick={() => setOrderPage(orderPage + 1)}
              className={`px-3 py-1.5 rounded-lg border transition ${
                orderPage >= totalOrderPages ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 cursor-pointer'
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

export default AdminOrdersTab;
