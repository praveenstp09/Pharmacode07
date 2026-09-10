import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  BookOpen,
  CheckCircle2,
  ShoppingCart,
  Play,
} from 'lucide-react';
import PriceDisplay from '../PriceDisplay';

const TestSeriesCard = ({
  item,
  isPurchased = false,
  onAddToCart,
  variant = 'marketplace', // 'marketplace' | 'home' | 'dashboard'
}) => {
  if (!item) return null;

  // 1. Dashboard Enrolled Variant
  if (variant === 'dashboard') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-blue-300 transition">
        <div className="relative h-40 bg-slate-100 overflow-hidden">
          <img
            src={item.thumbnail || '/placeholder-test.jpg'}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent" />
          <div className="absolute bottom-3 left-3 text-white text-xs font-semibold">
            {item.totalTests || 1} Tests {item.totalQuestions > 0 ? `• ${item.totalQuestions} Questions` : (item.totalPdfs ? `• ${item.totalPdfs} PDFs` : '')}
          </div>
        </div>

        <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition">
              <Link to={`/test-series/${item.slug}`}>{item.title}</Link>
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
          </div>

          <Link
            to={`/test-series/${item.slug}`}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start / Resume Mock Tests</span>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Marketplace & Home Standard Variant
  const numPrice = Number(item.price || 0);
  const numDiscount = item.discountPrice !== undefined && item.discountPrice !== null ? Number(item.discountPrice) : numPrice;
  const hasDiscount = numPrice > numDiscount && !item.isFree;
  const percentOff = hasDiscount ? Math.round(((numPrice - numDiscount) / numPrice) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={item.thumbnail || '/placeholder-test.jpg'}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white font-bold text-xs px-2 py-1 rounded-md shadow">
            {percentOff}% OFF
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <FileCheck className="w-3.5 h-3.5 text-blue-300" />
            <span>{item.totalTests || 1} Tests</span>
          </span>
          {item.totalQuestions > 0 ? (
            <span className="flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>{item.totalQuestions} MCQs</span>
            </span>
          ) : item.totalPdfs > 0 ? (
            <span className="flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>{item.totalPdfs} Solved PDFs</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition">
            <Link to={`/test-series/${item.slug}`}>{item.title}</Link>
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Highlights */}
        {item.highlights && item.highlights.length > 0 && (
          <div className="space-y-1.5 py-2 border-t border-b border-slate-100 text-xs text-slate-600">
            {item.highlights.slice(0, 3).map((h, i) => (
              <div key={i} className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="truncate">{h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pricing & CTA */}
        <div className="pt-2 flex items-center justify-between">
          <PriceDisplay
            price={item.price}
            discountPrice={item.discountPrice}
            isFree={item.isFree}
          />

          <div className="flex items-center space-x-2">
            {isPurchased ? (
              <Link
                to={`/test-series/${item.slug}`}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition whitespace-nowrap cursor-pointer"
              >
                Enrolled (Start Test)
              </Link>
            ) : (
              <>
                {onAddToCart && !item.isFree && (
                  <button
                    type="button"
                    onClick={() => onAddToCart(item)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-700 transition cursor-pointer"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                )}
                <Link
                  to={`/test-series/${item.slug}`}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition whitespace-nowrap cursor-pointer"
                >
                  {item.isFree ? 'Start Test' : 'Buy Now'}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSeriesCard;
