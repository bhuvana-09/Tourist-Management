import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { backendApi as api } from "../api/axiosInstance";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/bookings/me");
      setBookings(res || []);
    } catch (err) {
      console.error("Error fetching my bookings:", err);
      setError("Failed to load your bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  return (
    <div className="page-shell space-y-8 animate-fade">
      {/* Header Section */}
      <div className="text-center space-y-3 py-6">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
          Your Account
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
          My Bookings
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          View your travel history, active reservations, and package checkout summaries
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 animate-pulse">
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-700">Loading your bookings...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-red-700 mb-2">{error}</p>
          <button onClick={fetchMyBookings} className="btn-primary mt-4">
            Try Again
          </button>
        </div>
      )}

      {/* Bookings Display */}
      {!loading && !error && bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-800">You don't have any bookings yet</p>
          <p className="text-sm text-slate-500 mt-1 mb-6">Explore our curated travel packages and start planning today!</p>
          <Link to="/packages" className="btn-primary px-6 py-3 text-base">
            Explore Packages
          </Link>
        </div>
      ) : (
        !loading && !error && bookings.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {bookings.map((b, index) => {
              const packageName = b.packageId?.packageName || b.packageName || "Unknown Package";
              const price = b.packageId?.price ? `₹${b.packageId.price * b.travelers}` : "N/A";
              
              return (
                <div
                  key={b.id}
                  className="animate-scale-in rounded-2xl bg-white shadow-lg p-6 card-hover border border-slate-100 flex flex-col justify-between"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div>
                    {/* Header */}
                    <div className="pb-4 border-b border-slate-100 mb-4 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-slate-900">
                        {packageName}
                      </h2>
                      <span className="px-3 py-1 rounded-full bg-green-50 text-[10px] font-bold text-green-700 uppercase tracking-wide">
                        Confirmed
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="text-sm">
                          <span className="text-slate-500">Travel Date: </span>
                          <span className="font-semibold text-slate-800">{b.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <div className="text-sm">
                          <span className="text-slate-500">Travelers: </span>
                          <span className="font-semibold text-slate-800">{b.travelers} {b.travelers === 1 ? 'Person' : 'People'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div className="text-sm">
                          <span className="text-slate-500">Contact Phone: </span>
                          <span className="text-slate-700">{b.phone}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm">
                          <span className="text-slate-500">Total Price: </span>
                          <span className="font-bold text-green-600 text-lg">{price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
