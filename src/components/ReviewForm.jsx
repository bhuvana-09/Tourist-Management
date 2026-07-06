import React, { useState, useEffect } from "react";
import RatingStars from "./RatingStars";

export default function ReviewForm({ bookings = [], onSubmit, preselectedBookingId }) {
  const [bookingId, setBookingId] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedBookingId) {
      setBookingId(preselectedBookingId);
    } else if (bookings.length > 0) {
      setBookingId(bookings[0].id);
    }
  }, [preselectedBookingId, bookings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!bookingId) {
      setError("Please select a trip to review");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5");
      return;
    }
    if (!text.trim()) {
      setError("Please write a message detailing your travel experience");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ bookingId, rating, text: text.trim() });
      setText("");
      setRating(5);
    } catch (err) {
      setError(err || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Leave a Review</h3>
        <p className="text-xs text-slate-500">Share your travel feedback with the community</p>
      </div>

      {/* Select Booking */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Select Booking
        </label>
        <select
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          className="input-field py-2 px-3 text-sm"
          disabled={submitting || bookings.length === 0}
        >
          {bookings.length === 0 ? (
            <option value="">No eligible trips to review</option>
          ) : (
            bookings.map((b) => (
              <option key={b.id} value={b.id}>
                Date: {b.date} ({b.travelers} {b.travelers === 1 ? "Traveler" : "Travelers"})
              </option>
            ))
          )}
        </select>
      </div>

      {/* Rating stars */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Your Rating
        </label>
        <RatingStars rating={rating} onChange={setRating} interactive={true} size="w-7 h-7" />
      </div>

      {/* Text area */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Travel Feedback
        </label>
        <textarea
          rows="4"
          placeholder="What did you enjoy about the destination? How was the service and tour package itinerary?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input-field text-sm"
          disabled={submitting}
          required
        ></textarea>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || bookings.length === 0}
        className="w-full btn-primary py-2.5 text-sm font-semibold"
      >
        {submitting ? "Submitting Review..." : "Submit Review"}
      </button>
    </form>
  );
}
