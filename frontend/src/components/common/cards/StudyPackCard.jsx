import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  ShoppingCart,
} from 'lucide-react';
import PriceDisplay from '../PriceDisplay';

const StudyPackCard = ({
  pack,
  isPurchased = false,
  onAddToCart,
  variant = 'marketplace', // 'marketplace' | 'dashboard'
}) => {
  if (!pack) return null;

  // 1. Dashboard Enrolled Variant (horizontal card)
  if (variant === 'dashboard') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between gap-4 hover:border-blue-300 transition">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              {pack.courseType}
            </span>
            {pack.scopeLabel && (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {pack.scopeLabel}
              </span>
            )}
          </div>
          <h4 className="font-bold text-slate-900 text-sm leading-snug">{pack.title}</h4>
          <p className="text-xs text-slate-500">{pack.totalPdfs || 0} PDFs Included • 365 Days Access</p>
        </div>

        <Link
          to={`/study-materials/${pack.slug}`}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex-shrink-0 cursor-pointer"
        >
          Open Notes →
        </Link>
      </div>
    );
  }

  // 2. Marketplace Standard Variant (vertical card)
  const discountPercent =
    pack.price && pack.discountPrice
      ? Math.round(((pack.price - pack.discountPrice) / pack.price) * 100)
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col group">
      {/* Thumbnail / Header Area */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img
          src={pack.thumbnail || '/placeholder-notes.jpg'}
          alt={pack.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

        {/* Course Badge */}
        <div className="absolute top-3 left-3 bg-blue-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
          {pack.courseType}
        </div>

        {/* Discount Badge */}
        {discountPercent > 0 && !pack.isFree && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white font-bold text-xs px-2 py-1 rounded-md shadow">
            {discountPercent}% OFF
          </div>
        )}

        {/* Free Badge */}
        {pack.isFree && (
          <div className="absolute top-3 right-3 bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-md shadow uppercase tracking-wide">
            100% FREE
          </div>
        )}

        {/* Bottom overlay info */}
        <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center space-x-1.5 bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-md">
            <FileText className="w-3.5 h-3.5 text-blue-300" />
            <span>{pack.totalPdfs || 0} PDFs Included</span>
          </span>
          {pack.scopeLabel && (
            <span className="bg-indigo-600/80 backdrop-blur-sm px-2.5 py-1 rounded-md">
              {pack.scopeLabel}
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition">
            <Link to={`/study-materials/${pack.slug}`}>{pack.title}</Link>
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {pack.description}
          </p>

          {/* Highlights */}
          {Array.isArray(pack.highlights) && pack.highlights.length > 0 && (
            <div className="space-y-1.5 pt-2">
              {pack.highlights.slice(0, 3).map((hl, i) => (
                <div key={i} className="flex items-center space-x-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">{hl}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <PriceDisplay
              price={pack.price}
              discountPrice={pack.discountPrice}
              isFree={pack.isFree}
            />
            <span className="text-[11px] text-slate-400 font-medium">365 Days Access</span>
          </div>

          <div className="flex items-center space-x-2">
            {isPurchased || pack.isFree ? (
              <Link
                to={`/study-materials/${pack.slug}`}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition whitespace-nowrap cursor-pointer"
              >
                Open Material →
              </Link>
            ) : (
              <>
                {onAddToCart && !pack.isFree && (
                  <button
                    type="button"
                    onClick={() => onAddToCart(pack)}
                    className="p-2.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl transition cursor-pointer"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                )}
                <Link
                  to={`/study-materials/${pack.slug}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition whitespace-nowrap cursor-pointer"
                >
                  View Pack →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPackCard;
