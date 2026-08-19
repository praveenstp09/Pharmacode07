import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Banner = () => {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white text-xs md:text-sm py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <span className="bg-yellow-400 text-slate-900 font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider animate-pulse">
            Special Offer
          </span>
          <span className="font-medium truncate">
            🎯 GSSSB Junior Pharmacist & UPSSSC Model Papers live! Use code <strong className="text-yellow-300 font-bold tracking-wide">PHARMA10</strong> for 10% OFF.
          </span>
        </div>
        <Link
          to="/test-series"
          className="hidden md:inline-flex items-center space-x-1 text-white hover:text-yellow-200 font-semibold transition ml-4 whitespace-nowrap"
        >
          <span>Explore Papers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default Banner;
