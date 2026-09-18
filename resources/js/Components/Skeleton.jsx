import React from 'react';

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 animate-pulse">
      <div className="w-full h-40 bg-slate-100 rounded-2xl" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
        <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 bg-slate-100 rounded-lg w-full" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-200 rounded-lg flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="p-4 border-b border-slate-50">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-slate-100 rounded-lg flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-3">
          <div className="h-4 bg-slate-100 rounded-lg w-1/3" />
          <div className="h-8 bg-slate-100 rounded-lg w-1/2" />
        </div>
      ))}
    </div>
  );
}
