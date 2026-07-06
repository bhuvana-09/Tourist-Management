import { useState } from "react";
import { backendApi as api } from "../api/axiosInstance";

export default function AIItineraryGenerator({ destinationId }) {
  const [activeTab, setActiveTab] = useState("itinerary"); // itinerary, budget, packing, tips
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAiUnavailable, setIsAiUnavailable] = useState(false);

  // Input states
  const [days, setDays] = useState(3);
  const [budgetTier, setBudgetTier] = useState("mid-range");
  const [totalBudget, setTotalBudget] = useState(1500);
  const [travelers, setTravelers] = useState(2);
  const [season, setSeason] = useState("summer");

  // Output states
  const [itineraryResult, setItineraryResult] = useState(null);
  const [budgetResult, setBudgetResult] = useState(null);
  const [packingResult, setPackingResult] = useState(null);
  const [tipsResult, setTipsResult] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setIsAiUnavailable(false);

    try {
      if (activeTab === "itinerary") {
        setItineraryResult(null);
        const res = await api.post("/ai/itinerary", {
          destinationId,
          days: Number(days),
          budget: budgetTier
        });
        setIsAiUnavailable(!!res.aiUnavailable);
        if (res.aiUnavailable) setError(res.message);
        else setItineraryResult(res.data);
      } else if (activeTab === "budget") {
        setBudgetResult(null);
        const res = await api.post("/ai/budget-optimizer", {
          destinationId,
          days: Number(days),
          budget: Number(totalBudget),
          travelers: Number(travelers)
        });
        setIsAiUnavailable(!!res.aiUnavailable);
        if (res.aiUnavailable && !res.data) setError(res.message);
        else setBudgetResult(res.data);
      } else if (activeTab === "packing") {
        setPackingResult(null);
        const res = await api.post("/ai/packing-list", {
          destinationId,
          days: Number(days),
          season
        });
        setIsAiUnavailable(!!res.aiUnavailable);
        if (res.aiUnavailable && !res.data) setError(res.message);
        else setPackingResult(res.data);
      } else if (activeTab === "tips") {
        setTipsResult(null);
        const res = await api.post("/ai/travel-tips", { destinationId });
        setIsAiUnavailable(!!res.aiUnavailable);
        if (res.aiUnavailable && !res.data) setError(res.message);
        else setTipsResult(res.data);
      }
    } catch (err) {
      console.error(`AI ${activeTab} tool failed:`, err);
      setIsAiUnavailable(true);
      setError("Service connection failed. Showing fallbacks shortly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-slate-900">AI Travel Planner</h3>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[9px] uppercase tracking-wider">
            Gemini Powered
          </span>
        </div>
        <p className="text-xs text-slate-500">Instant AI generation tools for custom trips</p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-100 text-xs">
        {[
          { id: "itinerary", label: "Itinerary" },
          { id: "budget", label: "Budget" },
          { id: "packing", label: "Packing" },
          { id: "tips", label: "Travel Tips" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setError("");
            }}
            className={`flex-1 pb-3 font-semibold transition-colors ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-400 hover:text-slate-650"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Common Days Field */}
          {activeTab !== "tips" && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Duration
              </label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="input-field py-1.5 px-3 text-xs"
                disabled={loading}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 1 ? "Day" : "Days"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Itinerary: Budget Level */}
          {activeTab === "itinerary" && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Budget Tier
              </label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value)}
                className="input-field py-1.5 px-3 text-xs"
                disabled={loading}
              >
                <option value="budget">Budget Saver</option>
                <option value="mid-range">Mid-Range Comfort</option>
                <option value="luxury">Premium Luxury</option>
              </select>
            </div>
          )}

          {/* Budget: Total Amount */}
          {activeTab === "budget" && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Total Budget (USD)
                </label>
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="input-field py-1.5 px-3 text-xs"
                  disabled={loading}
                  min={100}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Travelers
                </label>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="input-field py-1.5 px-3 text-xs"
                  disabled={loading}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => (
                    <option key={t} value={t}>
                      {t} {t === 1 ? "Person" : "People"}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Packing: Season */}
          {activeTab === "packing" && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Trip Season
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="input-field py-1.5 px-3 text-xs"
                disabled={loading}
              >
                <option value="summer">Summer / Warm</option>
                <option value="winter">Winter / Cold</option>
                <option value="rainy">Rainy / Monsoon</option>
                <option value="spring">Spring / Autumn</option>
              </select>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Thinking...
            </>
          ) : (
            `Generate ${activeTab.toUpperCase()}`
          )}
        </button>
      </form>

      {/* Error & Warning Notification */}
      {error && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl text-xs space-y-1">
          <p className="font-semibold">{isAiUnavailable ? "AI Offline (Fallback Mode)" : "Failed"}</p>
          <p className="text-slate-500">{error}</p>
        </div>
      )}

      {/* Results Container */}
      <div className="max-h-[350px] overflow-y-auto pr-1">
        {/* Itinerary Results */}
        {activeTab === "itinerary" && itineraryResult && itineraryResult.days && (
          <div className="space-y-4 animate-fade">
            <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-5">
              {itineraryResult.days.map((day) => (
                <div key={day.dayNumber} className="relative space-y-1">
                  <div className="absolute -left-[25px] top-1 w-4.5 h-4.5 rounded-full bg-blue-600 border-4 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm">
                    {day.dayNumber}
                  </div>
                  <h5 className="font-bold text-slate-850 text-xs">{day.title}</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed whitespace-pre-line">
                    {day.activities}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Optimizer Results */}
        {activeTab === "budget" && budgetResult && budgetResult.breakdown && (
          <div className="space-y-4 animate-fade">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-150 mb-2">
              <span className="text-[11px] font-bold text-slate-700">Total Allocated Budget</span>
              <span className="text-xs font-extrabold text-blue-700">${budgetResult.totalBudget}</span>
            </div>
            <div className="space-y-3">
              {budgetResult.breakdown.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.category}</span>
                    <span className="text-slate-500">
                      {item.percentage}% (${item.amount})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 italic leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Packing Checklist Results */}
        {activeTab === "packing" && packingResult && packingResult.categories && (
          <div className="space-y-4 animate-fade">
            {packingResult.categories.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-1">
                  {cat.name}
                </h5>
                <ul className="space-y-1.5 pl-1">
                  {cat.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2 text-[11px] text-slate-650">
                      <input type="checkbox" className="mt-0.5 rounded text-blue-600 focus:ring-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Travel Tips Results */}
        {activeTab === "tips" && tipsResult && tipsResult.tips && (
          <div className="space-y-4 animate-fade">
            {tipsResult.tips.map((tip, idx) => (
              <div key={idx} className="bg-blue-50/30 p-3 rounded-xl border border-blue-100/40 space-y-1">
                <h5 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  💡 {tip.title}
                </h5>
                <p className="text-[11px] text-slate-600 leading-relaxed">{tip.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-[9px] text-slate-450 text-center leading-normal">
        ⚠️ Generated preview contents are dynamic recommendations and not saved to profile bookings.
      </div>
    </div>
  );
}
