import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4 animate-pulse">
    <div className="h-44 bg-slate-200 rounded-2xl w-full" />
    <div className="space-y-2">
      <div className="h-3 bg-slate-200 rounded w-1/4" />
      <div className="h-5 bg-slate-200 rounded w-4/5" />
      <div className="h-3 bg-slate-200 rounded w-full" />
      <div className="h-3 bg-slate-200 rounded w-2/3" />
    </div>
    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
      <div className="h-6 bg-slate-200 rounded w-20" />
      <div className="h-9 bg-slate-200 rounded-xl w-24" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 4 }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, idx) => (
      <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
        <div className="space-y-1.5 w-1/2">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
        <div className="h-8 bg-slate-200 rounded-lg w-20" />
      </div>
    ))}
  </div>
);

export default CardSkeleton;
