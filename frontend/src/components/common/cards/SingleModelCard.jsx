import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Lock, ShoppingCart } from 'lucide-react';

const SingleModelCard = ({
  paper,
  isPurchased = false,
  onAddToCart,
  onBuyNow,
  variant = 'marketplace', // 'marketplace' | 'dashboard'
}) => {
  const navigate = useNavigate();
  if (!paper) return null;

  const paperId = paper.testPaperId?._id || paper.testPaperId;

  // 1. Dashboard Enrolled Variant
  if (variant === 'dashboard') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-extrabold rounded-md uppercase">
              {paper.examType || 'Pharmacist'}
            </span>
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              ✓ Enrolled
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-base leading-snug">
            {paper.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{paper.description}</p>

          <div className="flex items-center space-x-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span>⏱️ {paper.durationMinutes || 100} Mins</span>
            <span>📝 {paper.totalQuestions || 100} MCQs</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          {paperId ? (
            <Link
              to={`/attempt/${paperId}`}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start CBT Test</span>
            </Link>
          ) : (
            <div className="w-full py-2 bg-slate-100 text-slate-400 font-medium text-xs rounded-xl text-center">
              Test Paper Pending
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Marketplace Standard Variant
  const displayPrice = paper.discountPrice !== null && paper.discountPrice !== undefined ? paper.discountPrice : paper.price;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700">
            {paper.examType}
          </span>
          {paper.isFree ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
              Free Demo
            </span>
          ) : isPurchased ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
              ✓ Enrolled
            </span>
          ) : (
            <span className="text-xs font-extrabold text-slate-900">
              ₹{displayPrice}
            </span>
          )}
        </div>

        <h3 className="font-extrabold text-slate-900 text-base leading-snug">
          {paper.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {paper.description || 'Full syllabus official practice model paper with negative marking.'}
        </p>

        <div className="flex items-center space-x-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <span>⏱️ {paper.durationMinutes || paper.testPaperId?.durationMinutes || 100} Mins</span>
          <span>📝 {paper.totalQuestions || paper.testPaperId?.totalQuestions || 100} MCQs</span>
          {Number(paper.testPaperId?.negativeMarks ?? 0.25) === 0 ? (
            <span className="text-emerald-700 font-semibold">No -ve Mark</span>
          ) : (
            <span>-{paper.testPaperId?.negativeMarks ?? 0.25} Marking</span>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100">
        {isPurchased ? (
          paperId ? (
            <Link
              to={`/attempt/${paperId}`}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{paper.isFree ? 'Start Free CBT Mock Exam' : 'Take Online CBT Exam'}</span>
            </Link>
          ) : (
            <div className="w-full py-2.5 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl text-center">
              CBT Questions Coming Soon
            </div>
          )
        ) : (
          <div className="flex items-center space-x-2">
            {onAddToCart && (
              <button
                type="button"
                onClick={() => onAddToCart(paper)}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-700 transition cursor-pointer"
                title="Add to Cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (onBuyNow) {
                  onBuyNow(paper);
                } else if (onAddToCart) {
                  onAddToCart(paper);
                  navigate('/checkout');
                }
              }}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Buy Now (₹{displayPrice})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleModelCard;
