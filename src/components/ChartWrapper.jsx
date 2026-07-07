import React from "react";

export default function ChartWrapper({ title, loading, children }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-[360px] relative overflow-hidden transition-all hover:shadow-md duration-200">
      <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-3 mb-4">
        {title}
      </h3>

      <div className="flex-1 w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="w-full h-full text-[11px] font-medium text-slate-400">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
