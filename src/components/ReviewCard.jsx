import React from "react";
import RatingStars from "./RatingStars";

export default function ReviewCard({ review, currentUser, onDelete }) {
  const authorName = review.userId?.name || "Anonymous User";
  const authorRole = review.userId?.role || "user";
  const isAuthor = currentUser && review.userId && (review.userId._id === currentUser._id || review.userId === currentUser._id);
  const isAdmin = currentUser && currentUser.role === "admin";
  const canDelete = isAuthor || isAdmin;

  const dateStr = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100/80 space-y-3 transition-all hover:bg-slate-50 duration-200">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm uppercase">
            {authorName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-800 text-sm">{authorName}</span>
              {authorRole === "admin" && (
                <span className="px-1.5 py-0.5 rounded bg-blue-55 text-blue-700 font-bold text-[9px] uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">{dateStr}</span>
          </div>
        </div>

        {canDelete && (
          <button
            onClick={() => onDelete(review.id)}
            className="text-slate-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
            title="Delete Review"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <RatingStars rating={review.rating} size="w-4 h-4" />
          {review.sentimentLabel && (
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                review.sentimentLabel === "positive"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-150"
                  : review.sentimentLabel === "negative"
                  ? "bg-rose-50 text-rose-700 border border-rose-150"
                  : "bg-slate-100 text-slate-750 border border-slate-200"
              }`}
            >
              {review.sentimentLabel}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-650 leading-relaxed pr-2">
          {review.text}
        </p>
      </div>
    </div>
  );
}
