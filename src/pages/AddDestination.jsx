import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendApi as api } from "../api/axiosInstance";

export default function AddDestination() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    tags: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("location", form.location);
    formData.append("description", form.description);
    
    if (form.tags) {
      formData.append("tags", form.tags);
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }

    api.post("/destinations", formData)
      .then(() => {
        navigate("/destinations");
      })
      .catch((err) => {
        console.error("Failed to add destination:", err);
        setError(err.response?.data?.message || err.message || "Failed to add destination");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="page-shell animate-fade">
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Add New Destination
          </h1>
          <p className="text-slate-600">
            Create a new tourist destination in your system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Destination Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              className="input-field"
              placeholder="e.g., Goa, Manali, Jaipur"
              value={form.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              className="input-field"
              placeholder="e.g., India, Himachal Pradesh"
              value={form.location}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              className="input-field min-h-[120px] resize-y"
              placeholder="Describe the destination..."
              value={form.description}
              onChange={handleChange}
              required
              disabled={loading}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tags (comma-separated, optional)
            </label>
            <input
              type="text"
              name="tags"
              className="input-field"
              placeholder="e.g., beach, budget, adventure"
              value={form.tags}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Upload Image (Optional, max 5MB)
            </label>
            <input
              type="file"
              accept="image/*"
              className="input-field py-2"
              onChange={handleFileChange}
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
                  Uploading...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Add Destination
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/destinations")}
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
