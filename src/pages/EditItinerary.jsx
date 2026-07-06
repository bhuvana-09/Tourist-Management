import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { backendApi as api } from "../api/axiosInstance";

export default function EditItinerary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    destinationId: "",
    day: "",
    activity: "",
    time: ""
  });
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Fetch itinerary
    api.get(`/itineraries/${id}`)
      .then((res) => {
        // res is unwrapped to the itinerary object
        const item = res;
        setForm({
          destinationId: item.destinationId?.id || item.destinationId || "",
          day: item.day || "",
          activity: item.activity || "",
          time: item.time || ""
        });
      })
      .catch((err) => {
        console.error("Failed to fetch itinerary details:", err);
        setError("Itinerary not found");
      })
      .finally(() => {
        setFetching(false);
      });

    // 2. Fetch destinations
    api.get("/destinations?limit=100")
      .then((res) => {
        setDestinations(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load destinations:", err);
      });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      destinationId: form.destinationId,
      day: Number(form.day),
      activity: form.activity,
      time: form.time
    };

    api.put(`/itineraries/${id}`, payload)
      .then(() => {
        alert("Updated successfully!");
        navigate("/itineraries");
      })
      .catch((err) => {
        console.error("Update failed:", err);
        setError(err.response?.data?.message || err.message || "Update failed");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade">
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Edit Itinerary
          </h1>
          <p className="text-slate-600">
            Update itinerary information and details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Destination <span className="text-red-500">*</span>
            </label>
            <select
              name="destinationId"
              className="input-field"
              value={form.destinationId}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">-- Choose a Destination --</option>
              {destinations.map((dest) => (
                <option key={dest.id} value={dest.id}>
                  {dest.name} ({dest.location})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Day Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="day"
                className="input-field"
                placeholder="e.g., 1"
                min="1"
                value={form.day}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="time"
                className="input-field"
                placeholder="e.g., 09:00 AM, Evening"
                value={form.time}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Activity Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="activity"
              className="input-field"
              placeholder="e.g., Visit the historic Baga beach"
              value={form.activity}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 btn-primary py-3 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Itinerary
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/itineraries")}
              className="btn-secondary py-3 px-6"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
