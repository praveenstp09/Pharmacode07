import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  CreditCard,
  ArrowRight,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Helper to dynamically load Razorpay checkout script if missing
const loadRazorpayScript = () => {
  return new Promise(resolve => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { items, subtotal, discountAmount, total, coupon, clearCart } = useCart();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Default to razorpay online payment
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
        <Link to="/test-series" className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl">
          Browse Test Series
        </Link>
      </div>
    );
  }

  const handleProcessPayment = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // 1. Create order on backend
      const orderRes = await api.post('/payments/create-order', {
        items,
        couponCode: coupon?.code || '',
        subtotal,
        discountAmount,
        totalAmount: total,
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to create order');
      }

      const { order, razorpayOrder, razorpayKeyId } = orderRes.data;

      // 2. If Razorpay order and key are present, open Razorpay Modal
      if (razorpayOrder && razorpayKeyId && paymentMethod !== 'simulated') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded || !window.Razorpay) {
          throw new Error('Could not load Razorpay payment gateway. Please check your internet or disable adblockers.');
        }

        const options = {
          key: razorpayKeyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'PharmaCode07',
          description: 'Pharmacy Test Series & Model Papers Purchase',
          image: '/logo.png',
          order_id: razorpayOrder.id,
          handler: async function (response) {
            try {
              const verifyRes = await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.data.success) {
                clearCart();
                await refreshUser();
                navigate('/dashboard?status=success&msg=Payment+successful!+Package+unlocked+for+365+days.');
              } else {
                setError('Payment verification failed. Please contact support.');
                setProcessing(false);
              }
            } catch (vErr) {
              setError('Payment verification failed: ' + (vErr.response?.data?.message || vErr.message));
              setProcessing(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.mobile || '',
          },
          theme: {
            color: '#2563EB',
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setError(`Payment failed: ${resp.error.description || 'Transaction declined'}`);
          setProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback or Simulated Instant Activation
        const simRes = await api.post('/payments/simulate', {
          orderId: order.orderId,
        });

        if (simRes.data.success) {
          clearCart();
          await refreshUser();
          navigate('/dashboard?status=success&msg=Package+unlocked+successfully');
        } else {
          throw new Error('Simulation failed');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment processing failed');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Checkout & Order Confirmation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Complete your purchase to immediately unlock 365-day access to your test packages.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Student Details & Payment Method */}
        <div className="lg:col-span-7 space-y-6">
          {/* User Account Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Student Details</span>
              {isAuthenticated && (
                <span className="text-[11px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Logged In
                </span>
              )}
            </h3>

            {isAuthenticated ? (
              <div className="text-xs sm:text-sm space-y-1 text-slate-700">
                <div>
                  <span className="text-slate-400 text-xs">Name:</span> <strong>{user.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Email:</span> <strong>{user.email}</strong>
                </div>
                {user.mobile && (
                  <div>
                    <span className="text-slate-400 text-xs">Mobile:</span> <strong>{user.mobile}</strong>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs sm:text-sm text-blue-800 space-y-2">
                <p className="font-semibold">
                  You are not logged in. Please log in or create an account to activate your package.
                </p>
                <div className="flex gap-2 pt-1">
                  <Link
                    to="/login?redirect=/checkout"
                    className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register?redirect=/checkout"
                    className="px-4 py-1.5 bg-white text-blue-700 font-bold rounded-lg text-xs border border-blue-300"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Payment Method
            </h3>

            <div className="space-y-3">
              {/* Razorpay Online Payment Option */}
              <label
                className={`flex items-start p-4 rounded-2xl border-2 cursor-pointer transition ${
                  paymentMethod === 'razorpay'
                    ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3 space-y-1">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="font-extrabold text-sm text-slate-900">
                      Razorpay Gateway (UPI / QR Code / GPay / PhonePe / Cards)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pay securely using official Razorpay modal. Supports Google Pay, PhonePe, Paytm, BHIM UPI, Debit/Credit Cards & NetBanking.
                  </p>
                </div>
              </label>

              {/* Simulated Option for quick test */}
              <label
                className={`flex items-start p-4 rounded-2xl border-2 cursor-pointer transition ${
                  paymentMethod === 'simulated'
                    ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="simulated"
                  checked={paymentMethod === 'simulated'}
                  onChange={() => setPaymentMethod('simulated')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-extrabold text-sm text-slate-900">
                      Instant Simulated Sandbox Test (No Payment Gateway)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Directly unlocks packages in 1 second without opening the gateway (for developer testing).
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Pay Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-6">
            <h3 className="font-extrabold text-slate-900 text-base pb-3 border-b border-slate-100">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Item List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0"
                >
                  <div className="max-w-[70%]">
                    <p className="font-bold text-slate-900 truncate">{item.title}</p>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {item.type}
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-900">₹{item.price}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({coupon?.code})</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Payable</span>
                <span className="text-blue-600 text-lg">₹{total}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleProcessPayment}
              disabled={processing || !isAuthenticated}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition transform active:scale-98 flex items-center justify-center space-x-2 text-sm sm:text-base cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>
                {processing
                  ? 'Opening Razorpay Gateway...'
                  : `Pay ₹${total} via Razorpay`}
              </span>
            </button>

            <div className="space-y-2 pt-1 text-[11px] text-slate-400">
              <div className="flex items-center space-x-1.5 justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>256-Bit SSL Encrypted & Razorpay Secured</span>
              </div>
              <p className="text-center text-[10px]">
                Valid for 365 Days • Instant Access to CBTs & PDFs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
