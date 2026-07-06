import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { backendApi as api } from "../api/axiosInstance";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/bookings");
      setBookings(res || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please check your admin privileges.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [location.pathname]);

  const deleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      await api.delete(`/bookings/${id}`);
      await fetchBookings();
    } catch (err) {
      console.error("Error deleting booking:", err);
      alert("Failed to delete booking. Please try again.");
    }
  };

  return (
    <div className="page-shell space-y-8 animate-fade">
      {/* Header Section */}
      <div className="text-center space-y-3 py-6">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
          Admin Portal
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
          All Bookings
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          Manage all reservations and history for legacy guests and registered users
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="inline-flex items-center gap-2 btn-secondary px-4 py-2 text-sm"
            title="Refresh bookings list"
          >
            <svg 
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          {!loading && bookings.length > 0 && (
            <span className="text-sm text-slate-600">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          )}
        </div>
        <Link
          to="/bookings/add"
          className="inline-flex items-center gap-2 btn-primary px-6 py-3 text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Booking
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 animate-pulse">
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-700">Loading bookings...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-red-700 mb-2">{error}</p>
          <button
            onClick={fetchBookings}
            className="btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Bookings Grid */}
      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-800">No bookings found</p>
          <p className="text-sm text-slate-500 mt-1">Create a booking to get started</p>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((b, index) => {
            const hasUser = !!b.userId;
            const customerName = b.userId?.name || b.name;
            const customerEmail = b.userId?.email || b.email;
            const packageName = b.packageId?.packageName || b.packageName || "Unknown Package";

            return (
              <div
                key={b.id}
                className="animate-scale-in rounded-2xl bg-white shadow-lg p-6 card-hover border border-slate-100 flex flex-col justify-between"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div>
                  {/* Package Header */}
                  <div className="pb-4 border-b border-slate-200 mb-4 flex justify-between items-start">
                    <h2 className="text-xl font-bold text-slate-900">
                      {packageName}
                    </h2>
                    {!hasUser && (
                      <span className="px-2.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        Guest (legacy)
                      </span>
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 uppercase">Customer Name</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">{customerName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 uppercase">Email</p>
                        <p className="text-sm text-slate-700 truncate">{customerEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 uppercase">Phone</p>
                        <p className="text-sm text-slate-700">{b.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase">Travelers</p>
                        <p className="text-sm font-semibold text-slate-900">{b.travelers} {b.travelers === 1 ? 'Person' : 'People'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase">Travel Date</p>
                        <p className="text-sm font-semibold text-slate-900">{b.date}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteBooking(b.id)}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 btn-danger text-sm py-2.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Booking
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Count Summary */}
      {!loading && !error && bookings.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{bookings.length}</span> {bookings.length === 1 ? 'booking' : 'bookings'}
          </p>
        </div>
      )}
    </div>
  );
}
