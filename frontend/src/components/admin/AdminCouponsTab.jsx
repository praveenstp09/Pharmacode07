import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import api from '../../services/api';

const ITEMS_PER_PAGE = 8;

const AdminCouponsTab = ({ coupons, fetchAdminData, showToast }) => {
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountPercent: 10,
    maxDiscount: 100,
    minOrderValue: 99,
    expiryDays: 30,
  });

  const [couponSearch, setCouponSearch] = useState('');
  const [couponPage, setCouponPage] = useState(1);

  const handleCreateCoupon = async e => {
    e.preventDefault();
    try {
      const expiryDate = new Date(
        Date.now() + (Number(newCoupon.expiryDays) || 30) * 24 * 60 * 60 * 1000
      );
      const res = await api.post('/admin/coupons', {
        ...newCoupon,
        expiryDate,
      });
      if (res.data.success) {
        showToast('Promo Code created successfully!', 'success');
        setNewCoupon({ code: '', discountPercent: 10, maxDiscount: 100, minOrderValue: 99, expiryDays: 30 });
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to create coupon: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDeleteCoupon = async id => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      const res = await api.delete(`/admin/coupons/${id}`);
      if (res.data.success) {
        showToast('Coupon deleted successfully', 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to delete coupon: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const filteredCoupons = coupons.filter(c =>
    !couponSearch || c.code?.toLowerCase().includes(couponSearch.toLowerCase())
  );
  const paginatedCoupons = filteredCoupons.slice((couponPage - 1) * ITEMS_PER_PAGE, couponPage * ITEMS_PER_PAGE);
  const totalCouponPages = Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE) || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Create Coupon Form */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">Create Discount Coupon</h3>
        <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs sm:text-sm">
          <div>
            <label className="font-bold text-slate-700">Coupon Code</label>
            <input
              type="text"
              required
              value={newCoupon.code}
              onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
              placeholder="e.g. PHARMA20"
              className="w-full mt-1 p-2.5 border rounded-xl uppercase font-bold tracking-wider"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700">Discount %</label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={newCoupon.discountPercent}
                onChange={e => setNewCoupon({ ...newCoupon, discountPercent: e.target.value })}
                className="w-full mt-1 p-2.5 border rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Max Discount (₹)</label>
              <input
                type="number"
                value={newCoupon.maxDiscount}
                onChange={e => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                className="w-full mt-1 p-2.5 border rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700">Min Order (₹)</label>
              <input
                type="number"
                value={newCoupon.minOrderValue}
                onChange={e => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
                className="w-full mt-1 p-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Expiry (Days)</label>
              <input
                type="number"
                value={newCoupon.expiryDays}
                onChange={e => setNewCoupon({ ...newCoupon, expiryDays: e.target.value })}
                className="w-full mt-1 p-2.5 border rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition cursor-pointer"
          >
            + Add Coupon Code
          </button>
        </form>
      </div>

      {/* Active Coupons List with Delete */}
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-base">Active Promo Codes ({filteredCoupons.length})</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={couponSearch}
              onChange={e => {
                setCouponSearch(e.target.value);
                setCouponPage(1);
              }}
              placeholder="Search code..."
              className="pl-8 pr-3 py-1.5 border rounded-xl text-xs bg-slate-50 focus:bg-white w-40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paginatedCoupons.map(c => (
            <div
              key={c._id}
              className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-2"
            >
              <div>
                <span className="font-extrabold text-indigo-700 text-base block">{c.code}</span>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  {c.discountPercent}% OFF (Max ₹{c.maxDiscount})
                </p>
                <span className="text-[10px] text-slate-400">Min Order: ₹{c.minOrderValue || 0}</span>
              </div>

              <button
                onClick={() => handleDeleteCoupon(c._id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                title="Delete Coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {filteredCoupons.length === 0 && (
            <div className="col-span-2 text-center py-6 text-slate-400 italic">
              No promo codes match your query.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalCouponPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
            <div>
              Showing {Math.min((couponPage - 1) * ITEMS_PER_PAGE + 1, filteredCoupons.length)} to{' '}
              {Math.min(couponPage * ITEMS_PER_PAGE, filteredCoupons.length)} of {filteredCoupons.length} items
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                disabled={couponPage === 1}
                onClick={() => setCouponPage(couponPage - 1)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  couponPage === 1 ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 cursor-pointer'
                }`}
              >
                ← Prev
              </button>
              <span className="px-2">
                Page {couponPage} of {totalCouponPages}
              </span>
              <button
                type="button"
                disabled={couponPage >= totalCouponPages}
                onClick={() => setCouponPage(couponPage + 1)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  couponPage >= totalCouponPages ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 cursor-pointer'
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

export default AdminCouponsTab;
