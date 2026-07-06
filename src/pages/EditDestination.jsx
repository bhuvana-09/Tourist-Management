import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { backendApi as api } from "../api/axiosInstance";

export default function EditDestination() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    tags: ""
  });
  const [currentImages, setCurrentImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/destinations/${id}`)
      .then((res) => {
        // res.data is unwrapped to the destination object directly
        const dest = res;
        setForm({
          name: dest.name || "",
          location: dest.location || "",
          description: dest.description || "",
          tags: dest.tags ? dest.tags.join(", ") : ""
        });
        setCurrentImages(dest.images || []);
      })
      .catch((err) => {
        console.error("Destination fetch failed:", err);
        setError("Destination not found");
      })
      .finally(() => {
        setFetching(false);
      });
  }, [id]);

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
    
    if (form.tags !== undefined) {
      formData.append("tags", form.tags);
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }

    api.put(`/destinations/${id}`, formData)
      .then(() => {
        alert("Updated successfully!");
        navigate("/destinations");
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
            Edit Destination
          </h1>
          <p className="text-slate-600">
            Update destination information and details
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

          {/* Image Preview Area */}
          {currentImages && currentImages.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Current Image
              </label>
              <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-slate-200">
                <img
                  src={currentImages[0]?.url}
                  alt="Current"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Replace Image (Optional, max 5MB)
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
                  Updating...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Destination
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
