import React from "react";

export default function RatingStars({ rating = 0, onChange, size = "w-5 h-5", interactive = false }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        const isFilled = star <= rating;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive || !onChange}
            onClick={() => onChange && onChange(star)}
            className={`transition-all focus:outline-none ${
              interactive && onChange
                ? "hover:scale-110 cursor-pointer active:scale-95"
                : "cursor-default"
            }`}
          >
            <svg
              className={`${size} ${
                isFilled ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"
              }`}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
