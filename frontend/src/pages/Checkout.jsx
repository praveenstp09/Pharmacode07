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
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const { items, subtotal, discountAmount, total, coupon, clearCart } = useCart();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('simulated'); // 'simulated' or 'razorpay'
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

      // 2. Handle Payment Method
      if (paymentMethod === 'simulated' || !razorpayKeyId) {
        // Instant simulated checkout
        const simRes = await api.post('/payments/simulate', {
          orderId: order.orderId,
        });

        if (simRes.data.success) {
          clearCart();
          await refreshUser();
          navigate('/dashboard?status=success&msg=Package+unlocked+successfully');
        }
      } else {
        // Razorpay Payment Flow
        if (!window.Razorpay) {
          throw new Error('Razorpay SDK not loaded. Please try simulated payment.');
        }

        const options = {
          key: razorpayKeyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'Pharmacode07Exams',
          description: 'Model Paper & Test Series Purchase',
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
                navigate('/dashboard?status=success&msg=Payment+verified+successfully');
              }
            } catch (vErr) {
              setError('Payment verification failed. Please contact support.');
              setProcessing(false);
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.mobile,
          },
          theme: {
            color: '#2563EB',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setError(`Payment failed: ${resp.error.description}`);
          setProcessing(false);
        });
        rzp.open();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment processing error');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-8 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Complete Your Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Review your student details and select your preferred payment mode.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Student Details & Payment Selector */}
        <div className="md:col-span-7 space-y-6">
          {/* Student Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Student Account</span>
              {!isAuthenticated && (
                <Link to="/login?redirect=/checkout" className="text-xs text-blue-600 font-bold hover:underline">
                  Already have an account? Login
                </Link>
              )}
            </h3>

            {isAuthenticated ? (
              <div className="text-sm space-y-1 text-slate-700">
                <div>
                  <span className="text-slate-400 text-xs">Name:</span> <strong>{user.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Email:</span> <strong>{user.email}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Mobile:</span> <strong>{user.mobile}</strong>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs sm:text-sm text-blue-800 space-y-2">
                <p className="font-semibold">
                  You are not logged in. You will be prompted to log in or register before checkout.
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
              Select Payment Option
            </h3>

            <div className="space-y-3">
              {/* Simulated Option */}
              <label
                className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition ${
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
                    <span className="font-bold text-sm text-slate-900">
                      Instant Simulated Payment (Sandbox / Test Mode)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Instantly activates test series in your account without real money deduction. Recommended for quick testing.
                  </p>
                </div>
              </label>

              {/* Razorpay Option */}
              <label
                className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition ${
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
                    <span className="font-bold text-sm text-slate-900">
                      Online Payment (UPI / GPay / PhonePe / Cards)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pay securely using Razorpay gateway. Supports all Indian UPI apps, RuPay/Visa/MasterCard, and NetBanking.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
              Items to Purchase ({items.length})
            </h3>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-700 font-medium truncate max-w-[200px]">
                    {item.title}
                  </span>
                  <span className="font-bold text-slate-900">₹{item.price}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({coupon?.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-extrabold text-base pt-2 border-t border-slate-100">
                <span>Amount to Pay</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={processing}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-lg transition transform hover:-translate-y-0.5 text-sm flex items-center justify-center space-x-2"
            >
              {processing ? (
                <span>Unlocking Your Test Papers...</span>
              ) : (
                <>
                  <span>Pay ₹{total} & Unlock Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-400 text-center space-y-1">
              <p>🔒 256-bit SSL Secure Checkout</p>
              <p>Instant Activation Guaranteed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
