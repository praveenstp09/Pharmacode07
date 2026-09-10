import React, { useState } from 'react';
import { Tag } from 'lucide-react';

const CouponForm = ({
  coupon,
  onApply,
  onRemove,
  className = '',
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code.trim() || !onApply) return;
    setError('');
    setLoading(true);
    try {
      const res = await onApply(code.trim().toUpperCase());
      if (res?.success === false || res?.error) {
        setError(res?.error || res?.message || 'Invalid coupon code');
      } else {
        setCode('');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to apply coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center space-x-2 text-slate-800 font-bold">
        <Tag className="w-5 h-5 text-blue-600" />
        <span>Apply Coupon Code</span>
      </div>

      {coupon ? (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold uppercase tracking-wide">{coupon.code}</span>
            <span className="text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
              {coupon.discountPercent}% OFF
            </span>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-600 hover:text-red-700 font-bold cursor-pointer"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex space-x-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApply();
                }
              }}
              placeholder="ENTER COUPON"
              className="flex-grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold uppercase focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
            />
            <button
              type="button"
              onClick={handleApply}
              disabled={loading || !code.trim()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? '...' : 'Apply'}
            </button>
          </div>
          {error && (
            <p className="text-xs text-red-600 font-medium">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponForm;
