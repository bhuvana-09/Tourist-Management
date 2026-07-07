import React from "react";

export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden animate-pulse flex flex-col justify-between h-96">
      <div>
        {/* Image block skeleton */}
        <div className="bg-slate-200 dark:bg-slate-800 h-48 w-full" />
        
        <div className="p-6 space-y-4">
          {/* Header titles skeleton */}
          <div className="h-4.5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          
          <div className="space-y-2 pt-2">
            {/* Description lines skeleton */}
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        {/* Footer actions skeleton */}
        <div className="h-8.5 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
      </div>
    </div>
  );
}
