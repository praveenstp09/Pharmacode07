import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Tag,
  ArrowRight,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const {
    items,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    total,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = async e => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponMsg('');
    setCouponError('');

    const res = await applyCoupon(couponCode);
    if (res.success) {
      setCouponMsg(res.message);
    } else {
      setCouponError(res.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          You have not added any model papers or test series to your cart yet.
        </p>
        <Link
          to="/test-series"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow transition"
        >
          Explore Model Papers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
        Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left items list (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {items.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  {item.examType && (
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">
                      {item.examType}
                    </span>
                  )}
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-extrabold text-slate-900">
                      ₹{item.price}
                    </span>
                    {item.originalPrice > item.price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{item.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Clear Cart
            </button>
            <Link
              to="/test-series"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              + Add More Test Series
            </Link>
          </div>
        </div>

        {/* Right Summary & Coupon (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Coupon Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
              <Tag className="w-4 h-4 text-blue-600" />
              <span>Apply Discount Coupon</span>
            </h4>

            {coupon ? (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-800 text-sm">
                    {coupon.code} applied!
                  </div>
                  <div className="text-xs text-emerald-600">
                    You saved ₹{discountAmount} ({coupon.discountPercent}% OFF)
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. PHARMA10"
                  className="flex-grow px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Apply
                </button>
              </form>
            )}

            {couponMsg && <p className="text-xs font-bold text-emerald-600">{couponMsg}</p>}
            {couponError && <p className="text-xs font-bold text-rose-600">{couponError}</p>}

            <div className="text-[11px] text-slate-500 pt-1">
              Tip: Try promo code <strong className="text-blue-600">PHARMA10</strong> for 10% instant discount.
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-extrabold text-lg pt-3 border-t border-slate-100">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-lg transition transform hover:-translate-y-0.5 text-sm flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-slate-400 text-center space-y-1">
              <p>🔒 100% Secure & Encrypted Payment</p>
              <p>Instant Activation in Student Dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
