import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { backendApi as api } from "../api/axiosInstance";

export default function AIRecommendationStrip() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAiUnavailable, setIsAiUnavailable] = useState(false);
  const [message, setMessage] = useState("");

  const placeholder =
    "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=800";

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        // Call the private recommendations endpoint
        const res = await api.post("/ai/recommendations");
        setRecommendations(res.data || []);
        setIsAiUnavailable(!!res.aiUnavailable);
        if (res.message) {
          setMessage(res.message);
        }
      } catch (err) {
        console.error("Failed to load AI recommendations:", err);
        setIsAiUnavailable(true);
        setMessage("Could not fetch personalized recommendations at this time.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-6 py-6 animate-fade border-b border-slate-100 pb-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900">
              {isAiUnavailable ? "Popular Destinations" : "Recommended for You"}
            </h2>
            {!isAiUnavailable && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-150 uppercase tracking-wider">
                <svg className="w-3.5 h-3.5 fill-blue-600" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
                </svg>
                AI Personalized
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAiUnavailable 
              ? "AI personalization is offline. Browse general popular catalog recommendations." 
              : "Custom tailored picks selected by our AI matching agent based on your past bookings history."}
          </p>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((dest) => {
          const imgUrl = dest.images && dest.images[0]?.url ? dest.images[0].url : placeholder;
          return (
            <div
              key={dest.id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail */}
                <Link to={`/destinations/${dest.id}`} className="block relative aspect-video overflow-hidden group">
                  <img
                    src={imgUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">{dest.location}</p>
                    <h3 className="font-bold text-base truncate">{dest.name}</h3>
                  </div>
                </Link>

                {/* Recommendation Rationale */}
                <div className="p-4 space-y-3">
                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 flex gap-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                      {dest.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* View detail footer */}
              <div className="px-4 pb-4">
                <Link
                  to={`/destinations/${dest.id}`}
                  className="w-full text-center inline-flex justify-center items-center gap-1.5 btn-secondary py-2 text-xs font-semibold"
                >
                  Explore Destination
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
