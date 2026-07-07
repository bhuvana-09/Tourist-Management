import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { backendApi as api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import WishlistButton from "../components/WishlistButton";

export default function Wishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/me/wishlist");
      // res is unwrapped to the array inside data field by our response interceptor
      setItems(res || []);
    } catch (err) {
      console.error("Failed to load wishlist items:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  // Listener to refresh if item is toggle-removed elsewhere
  const handleWishlistChange = () => {
    fetchWishlist();
  };

  const placeholder =
    "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=800";

  if (!user) {
    return (
      <div className="page-shell py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Please log in to view your wishlist</h2>
        <Link to="/login" className="btn-primary px-6 py-2 inline-block">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-8 animate-fade">
      {/* Header */}
      <div className="text-center space-y-3 py-6">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
          Your Saved Escapes
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
          My Wishlist
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          Keep track of destinations you plan to visit on your next adventure
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100/60 max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 mb-4">
            <svg
              className="w-8 h-8 text-rose-500 fill-rose-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-800">Your wishlist is empty</p>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Explore destinations and heart your favorites.
          </p>
          <Link to="/destinations" className="btn-primary px-6 py-2.5 text-xs font-semibold">
            Explore Destinations
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((dest) => (
            <div
              key={dest.id || dest._id}
              className="rounded-2xl bg-white shadow-lg overflow-hidden card-hover flex flex-col justify-between relative"
            >
              {/* Wishlist Button Overlay */}
              <div className="absolute top-4 right-4 z-10" onClick={handleWishlistChange}>
                <WishlistButton destinationId={dest.id || dest._id} />
              </div>

              <div>
                {/* Image Link */}
                <Link to={`/destinations/${dest.id || dest._id}`} className="block relative h-64 overflow-hidden group">
                  <img
                    src={dest.images && dest.images[0]?.url ? dest.images[0].url : placeholder}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = placeholder;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-xl font-bold text-white drop-shadow-lg group-hover:text-blue-200 transition-colors">
                      {dest.name}
                    </h2>
                    <p className="text-sm text-blue-100 mt-1">
                      {dest.location}
                    </p>
                  </div>
                </Link>

                <div className="p-6 space-y-4">
                  {/* Rating */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                      <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" />
                    </svg>
                    <span className="font-bold text-slate-700">{dest.avgRating !== undefined ? dest.avgRating : 0}</span>
                    <span>({dest.reviewCount !== undefined ? dest.reviewCount : 0} reviews)</span>
                  </div>

                  <p className="text-sm text-slate-700 line-clamp-3">
                    {dest.description}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6">
                <Link
                  to={`/destinations/${dest.id || dest._id}`}
                  className="w-full inline-flex items-center justify-center gap-2 btn-secondary text-sm py-2.5"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
