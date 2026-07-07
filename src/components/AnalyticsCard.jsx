import React from "react";

export default function AnalyticsCard({ title, value, icon, trend, trendType = "up" }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md duration-200">
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={`text-xs font-bold flex items-center ${
                trendType === "up"
                  ? "text-emerald-600"
                  : trendType === "down"
                  ? "text-rose-600"
                  : "text-slate-500"
              }`}
            >
              {trendType === "up" && "↑"}
              {trendType === "down" && "↓"}
              <span className="ml-0.5">{trend}</span>
            </span>
          )}
        </div>
      </div>

      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
