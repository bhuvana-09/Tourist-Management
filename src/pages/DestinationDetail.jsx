import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { backendApi as api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import RatingStars from "../components/RatingStars";
import ReviewCard from "../components/ReviewCard";
import ReviewForm from "../components/ReviewForm";
import AIItineraryGenerator from "../components/AIItineraryGenerator";

export default function DestinationDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedBookingId = searchParams.get("bookingId");

  const { isLoggedIn, user } = useAuth();

  const [destination, setDestination] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active picture gallery slide
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // FAQ states
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqError, setFaqError] = useState("");

  const handleRegenerateFAQ = async () => {
    setFaqLoading(true);
    setFaqError("");
    try {
      const res = await api.post(`/ai/faq/${id}`);
      if (res.aiUnavailable) {
        setFaqError(res.message || "Failed to generate FAQs.");
      } else {
        setDestination((prev) => ({
          ...prev,
          faq: res.data
        }));
      }
    } catch (err) {
      console.error("FAQ regeneration failed:", err);
      setFaqError("Failed to connect to the FAQ service.");
    } finally {
      setFaqLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch destination details
      const destRes = await api.get(`/destinations/${id}`);
      setDestination(destRes);

      // 2. Fetch destination reviews
      const reviewsRes = await api.get(`/destinations/${id}/reviews`);
      setReviews(reviewsRes || []);

      // 3. Fetch user bookings if logged in
      if (isLoggedIn) {
        const bookingsRes = await api.get("/bookings/me");
        setMyBookings(bookingsRes || []);
      }
    } catch (err) {
      console.error("Error loading destination details:", err);
      setError("Failed to load destination details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, isLoggedIn]);

  const handleReviewSubmit = async ({ bookingId, rating, text }) => {
    try {
      await api.post("/reviews", { bookingId, rating, text });
      alert("Review submitted successfully!");
      await fetchData(); // Refresh reviews and aggregates
    } catch (err) {
      console.error("Failed to submit review:", err);
      throw err.response?.data?.message || "Failed to submit review. Please try again.";
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await api.delete(`/reviews/${reviewId}`);
      alert("Review deleted successfully!");
      await fetchData(); // Refresh reviews and aggregates
    } catch (err) {
      console.error("Failed to delete review:", err);
      alert(err.response?.data?.message || "Failed to delete review. Please try again.");
    }
  };

  // Determine eligible bookings for this destination
  const getEligibleBookings = () => {
    if (!isLoggedIn) return [];

    return myBookings.filter((b) => {
      // Ensure booking belongs to packages of this destination
      const bookingDestId = b.packageId?.destinationId?._id || b.packageId?.destinationId || b.destinationId;
      if (bookingDestId !== id) return false;

      // Check status eligibility: status === 'completed', OR (status === 'confirmed' && paid && travelDate in past)
      const isCompleted = b.status === "completed";
      const isPaidPastTrip =
        b.status === "confirmed" &&
        b.paymentStatus === "paid" &&
        new Date(b.date) < new Date();

      if (!isCompleted && !isPaidPastTrip) return false;

      // Check if this booking has already been reviewed
      const alreadyReviewed = reviews.some((r) => r.bookingId === b.id || r.bookingId?._id === b.id);
      return !alreadyReviewed;
    });
  };

  if (loading) {
    return (
      <div className="page-shell flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 text-sm mt-4">Loading destination details...</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="page-shell max-w-md mx-auto py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
          <p className="font-semibold text-lg mb-2">Error</p>
          <p className="text-sm mb-4">{error || "Destination not found"}</p>
          <Link to="/destinations" className="btn-primary inline-flex">
            Back to Destinations
          </Link>
        </div>
      </div>
    );
  }

  const eligibleBookings = getEligibleBookings();
  const images = destination.images || [];

  return (
    <div className="page-shell space-y-12 animate-fade">
      {/* Detail Gallery & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Images Slideshow */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 shadow-md">
            {images.length > 0 ? (
              <img
                src={images[activeImageIndex].url}
                alt={destination.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                No images uploaded
              </div>
            )}

            {/* Slider Navigation Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === activeImageIndex ? "bg-white scale-110" : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 aspect-video rounded-xl overflow-hidden border-2 bg-slate-50 flex-shrink-0 transition-all ${
                    idx === activeImageIndex ? "border-blue-600 scale-105" : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              {destination.location}
            </span>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {destination.name}
            </h1>
            
            {/* Dynamic aggregated rating */}
            <div className="flex items-center gap-2 pt-1">
              <RatingStars rating={destination.avgRating} size="w-5 h-5" />
              <span className="text-sm font-bold text-slate-800">{destination.avgRating}</span>
              <span className="text-slate-400 text-sm">({destination.reviewCount} {destination.reviewCount === 1 ? 'review' : 'reviews'})</span>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed whitespace-pre-line text-base">
            {destination.description}
          </p>

          {/* Destination tags */}
          {destination.tags && destination.tags.length > 0 && (
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Category Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {destination.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick link button to Bookings page */}
          <div className="pt-4 border-t border-slate-100">
            <Link to="/bookings/add" className="btn-primary inline-flex px-8 py-3.5 text-sm font-bold shadow-lg shadow-blue-500/20">
              Book a Tour Package
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="border-t border-slate-100 pt-12 space-y-6 animate-fade">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-500">Grounded insights compiled by our AI agent based on local reviews.</p>
          </div>
          {user?.role === "admin" && (
            <button
              onClick={handleRegenerateFAQ}
              disabled={faqLoading}
              className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center gap-2 border-blue-100 text-blue-600 hover:bg-blue-50"
            >
              {faqLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-blue-650" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Regenerating FAQ...
                </>
              ) : (
                "🔄 Regenerate FAQ"
              )}
            </button>
          )}
        </div>

        {faqError && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl text-xs">
            {faqError}
          </div>
        )}

        {!destination.faq || destination.faq.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-500 text-sm">
            No FAQs available for this destination. {user?.role === "admin" && "Click Regenerate FAQ to build them using AI."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {destination.faq.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100/60 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs flex gap-2">
                  <span className="text-blue-600 font-extrabold">Q:</span>
                  {item.question}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-4">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Section */}
      <div className="border-t border-slate-100 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Customer Feedbacks</h2>
              <p className="text-sm text-slate-500">Read what other travelers had to say about this destination</p>
            </div>

            {/* AI reviews summary consensus */}
            {destination && destination.aiSummary && (
              <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-5 rounded-2xl border border-blue-100/60 space-y-2.5 animate-fade">
                <div className="flex items-center gap-2">
                  <span className="text-sm">✨</span>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    What Travelers Are Saying (AI Summary)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {destination.aiSummary}
                </p>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-500 text-sm">
                No reviews have been submitted for this destination yet. Be the first to leave feedback!
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {reviews.map((rev) => (
                  <ReviewCard
                    key={rev.id}
                    review={rev}
                    currentUser={user}
                    onDelete={handleReviewDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Side Review Form / Login CTA */}
          <div className="space-y-6">
            <AIItineraryGenerator destinationId={id} />

            {!isLoggedIn ? (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center space-y-4">
                <h3 className="font-bold text-slate-800 text-base">Been here before?</h3>
                <p className="text-xs text-slate-500">Log in to your account to write a review for your past bookings.</p>
                <Link to="/login" className="btn-secondary w-full inline-flex py-2 text-sm justify-center">
                  Sign In to Review
                </Link>
              </div>
            ) : eligibleBookings.length > 0 ? (
              <ReviewForm
                bookings={eligibleBookings}
                onSubmit={handleReviewSubmit}
                preselectedBookingId={preselectedBookingId}
              />
            ) : (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center space-y-3">
                <h3 className="font-semibold text-slate-700 text-sm">No Eligible Bookings</h3>
                <p className="text-xs text-slate-400">
                  Reviews are restricted to verified customers with completed packages to this destination.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
