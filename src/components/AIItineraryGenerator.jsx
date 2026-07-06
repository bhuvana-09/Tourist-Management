import { useState } from "react";
import { backendApi as api } from "../api/axiosInstance";

export default function AIItineraryGenerator({ destinationId }) {
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState("mid-range");
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAiUnavailable, setIsAiUnavailable] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setItinerary(null);
    setIsAiUnavailable(false);

    try {
      const res = await api.post("/ai/itinerary", {
        destinationId,
        days: Number(days),
        budget
      });

      if (res.aiUnavailable) {
        setIsAiUnavailable(true);
        setError(res.message || "AI generator is offline. Try again shortly.");
      } else {
        setItinerary(res.data || null);
      }
    } catch (err) {
      console.error("Itinerary generation failed:", err);
      setIsAiUnavailable(true);
      setError("Failed to connect to the itinerary planner. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-slate-900">AI Itinerary Planner</h3>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[9px] uppercase tracking-wider">
            BETA Preview
          </span>
        </div>
        <p className="text-xs text-slate-500">Generate a custom day-by-day sightseeing plan instantly</p>
      </div>

      <form onSubmit={handleGenerate} className="grid grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Duration
          </label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="input-field py-2 px-3 text-sm"
            disabled={loading}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
              <option key={d} value={d}>
                {d} {d === 1 ? "Day" : "Days"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Budget Tier
          </label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="input-field py-2 px-3 text-sm"
            disabled={loading}
          >
            <option value="budget">Budget Saver</option>
            <option value="mid-range">Mid-Range Comfort</option>
            <option value="luxury">Premium Luxury</option>
          </select>
        </div>

        <button
          type="submit"
          className="col-span-2 btn-primary py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Schedule...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z" />
              </svg>
              Build Preview
            </>
          )}
        </button>
      </form>

      {/* Error & Warning Notification */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs space-y-1">
          <p className="font-semibold">{isAiUnavailable ? "Plan Offline" : "Failed to load"}</p>
          <p className="text-slate-500">{error}</p>
        </div>
      )}

      {/* Generated Itinerary Display */}
      {itinerary && itinerary.days && (
        <div className="space-y-4 pt-4 border-t border-slate-100 animate-fade max-h-[500px] overflow-y-auto pr-1">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-slate-800 text-sm">Suggested Preview Schedule</h4>
            <span className="text-[10px] text-slate-400 capitalize">Budget: {budget}</span>
          </div>

          <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-6">
            {itinerary.days.map((day) => (
              <div key={day.dayNumber} className="relative space-y-1">
                {/* Timeline Dot */}
                <div className="absolute -left-[25px] top-1 w-4.5 h-4.5 rounded-full bg-blue-600 border-4 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm">
                  {day.dayNumber}
                </div>
                <h5 className="font-bold text-slate-900 text-sm">{day.title}</h5>
                <p className="text-xs text-slate-600 leading-relaxed leading-normal whitespace-pre-line">
                  {day.activities}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 mt-4 text-[10px] text-slate-450 leading-relaxed text-center">
            ⚠️ Note: This plan is an AI-generated preview. It is not saved to your profile or booking.
          </div>
        </div>
      )}
    </div>
  );
}
