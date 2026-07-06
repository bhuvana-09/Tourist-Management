import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendApi as api } from "../api/axiosInstance";

export default function AddDestination() {
  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    image: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post("/destinations", form).then(() => {
      navigate("/destinations");
    });
  };

  return (
    <div className="page-shell">
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
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              className="input-field min-h-[120px] resize-y"
              placeholder="Describe the destination, its attractions, and what makes it special..."
              value={form.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Image URL (Optional)
            </label>
            <input
              type="url"
              name="image"
              className="input-field"
              placeholder="https://example.com/image.jpg"
              value={form.image}
              onChange={handleChange}
            />
            <p className="text-xs text-slate-500 mt-1">
              Leave empty to use default image based on destination name
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 btn-primary py-3 text-base font-semibold"
            >
              <span className="inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Add Destination
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/destinations")}
              className="btn-secondary py-3 px-6"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
