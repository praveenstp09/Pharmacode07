import React from 'react';

const PriceDisplay = ({
  price,
  discountPrice,
  isFree = false,
  showBadge = false,
  size = 'md',
  className = '',
}) => {
  const numPrice = Number(price || 0);
  const numDiscount = discountPrice !== undefined && discountPrice !== null ? Number(discountPrice) : numPrice;
  const isFreeEffective = isFree || (numDiscount === 0 && numPrice === 0);
  const hasDiscount = numPrice > numDiscount && !isFreeEffective;
  const percentOff = hasDiscount ? Math.round(((numPrice - numDiscount) / numPrice) * 100) : 0;

  const sizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div className={`flex items-baseline flex-wrap gap-2 ${className}`}>
      <span className={`font-black text-slate-900 ${sizeClasses[size] || sizeClasses.md}`}>
        {isFreeEffective ? 'FREE' : `₹${numDiscount}`}
      </span>
      {hasDiscount && (
        <span className="text-xs text-slate-400 line-through">
          ₹{numPrice}
        </span>
      )}
      {showBadge && hasDiscount && (
        <span className="bg-emerald-100 text-emerald-700 font-bold text-xs px-2 py-0.5 rounded shadow-sm">
          {percentOff}% OFF
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
