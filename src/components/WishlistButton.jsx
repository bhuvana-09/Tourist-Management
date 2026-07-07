import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function WishlistButton({ destinationId }) {
  const { user, wishlist, toggleWishlist } = useAuth();
  const navigate = useNavigate();

  const isFavorite = wishlist.includes(destinationId);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    toggleWishlist(destinationId);
  };

  return (
    <button
      onClick={handleClick}
      className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 group flex items-center justify-center border border-slate-100 hover:scale-105"
      title={isFavorite ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <svg
        className={`w-5 h-5 transition-colors duration-250 ${
          isFavorite
            ? "fill-rose-500 stroke-rose-500 text-rose-500 scale-105"
            : "fill-transparent stroke-slate-500 text-slate-500 group-hover:stroke-rose-500 group-hover:text-rose-500"
        }`}
        viewBox="0 0 24 24"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
