import React from 'react';

const HeroBanner = ({
  pill,
  title,
  subtitle,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden ${className}`}>
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-4">
        {pill && (
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <span>{pill}</span>
          </div>
        )}
        {title && (
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

export default HeroBanner;
