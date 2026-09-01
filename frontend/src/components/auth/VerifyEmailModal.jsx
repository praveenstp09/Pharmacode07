import React, { useState, useEffect, useRef } from 'react';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VerifyEmailModal = ({ isOpen, onClose, email, onSuccess }) => {
  const { verifyEmailOTP, resendOTP } = useAuth();
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef([]);

  // Auto-focus first input box when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtpDigits(['', '', '', '', '', '']);
      setError('');
      setResendMessage('');
      setTimer(60);
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // 60-second cooldown timer for resending OTP
  useEffect(() => {
    let interval = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleDigitChange = (index, value) => {
    // Keep only numbers
    const cleanVal = value.replace(/\D/g, '');

    // Handle full paste
    if (cleanVal.length > 1) {
      const pastedDigits = cleanVal.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pastedDigits.forEach((digit, idx) => {
        if (index + idx < 6) {
          newDigits[index + idx] = digit;
        }
      });
      setOtpDigits(newDigits);
      const nextFocusIdx = Math.min(index + pastedDigits.length, 5);
      inputRefs.current[nextFocusIdx]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    setError('');

    // Advance to next box if digit entered
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      // If current box is empty and backspace pressed, jump to previous box
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');

    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await verifyEmailOTP(email, fullOtp);
      if (res && res.success) {
        if (onSuccess) onSuccess(res);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setError('');
    setResendMessage('');

    try {
      const res = await resendOTP(email);
      setResendMessage(res.message || 'A fresh 6-digit code has been sent to your email.');
      setTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-slate-100 transform transition-all animate-scaleUp">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Verify Your Email</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            We sent a 6-digit verification code to <br />
            <strong className="text-slate-800 font-semibold">{email}</strong>
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resendMessage && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{resendMessage}</span>
          </div>
        )}

        {/* 6-Digit OTP Inputs Form */}
        <form onSubmit={handleVerify} className="mt-6 space-y-6">
          <div className="flex justify-center items-center gap-2 sm:gap-3">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={e => handleDigitChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                  digit
                    ? 'border-blue-600 bg-blue-50/40 text-blue-900 focus:ring-blue-500'
                    : 'border-slate-200 bg-slate-50/50 text-slate-800 focus:border-blue-500 focus:ring-blue-400'
                }`}
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otpDigits.join('').length !== 6}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
              loading || otpDigits.join('').length !== 6
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-blue-600/30'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Account...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Verify & Activate Account</span>
              </>
            )}
          </button>
        </form>

        {/* Resend OTP Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Didn't receive the email? Check your spam folder or{' '}
          {timer > 0 ? (
            <span className="font-bold text-slate-700">resend in {timer}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailModal;
