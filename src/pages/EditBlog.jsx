import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { backendApi as api } from "../api/axiosInstance";

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/blogs/${id}`)
      .then((res) => {
        setForm({
          title: res.title || "",
          content: res.content || "",
          tags: res.tags ? res.tags.join(", ") : ""
        });
      })
      .catch((err) => {
        console.error("Failed to load blog post details:", err);
        setError("Failed to fetch blog post details.");
      })
      .finally(() => {
        setLoading(false);
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
    setSubmitting(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    
    if (form.tags !== undefined) {
      formData.append("tags", form.tags);
    }
    if (imageFile) {
      formData.append("image", imageFile); // Triggers replacement cleanup on the server
    }

    api.patch(`/blogs/${id}`, formData)
      .then(() => {
        alert("Blog article updated successfully!");
        navigate(`/blogs/${id}`);
      })
      .catch((err) => {
        console.error("Failed to update blog post:", err);
        setError(err.response?.data?.message || err.message || "Failed to update blog post");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  if (loading) {
    return (
      <div className="page-shell flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 text-sm mt-4">Loading article editor details...</p>
      </div>
    );
  }

  return (
    <div className="page-shell max-w-2xl mx-auto py-12 space-y-8 animate-fade">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <Link to={`/blogs/${id}`} className="text-xs font-bold text-slate-500 hover:text-slate-700">
          ← Cancel and Return
        </Link>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Edit Article
        </h1>
        <p className="text-sm text-slate-500">
          Modify draft text or update the cover image header.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Article Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            disabled={submitting}
            placeholder="e.g., Top 10 Hidden Gem Destinations in Jaipur"
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Category Tags
          </label>
          <input
            type="text"
            name="tags"
            disabled={submitting}
            placeholder="e.g., Travel, Guides, Jaipur (comma separated)"
            value={form.tags}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Cover Image */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Replacement Cover Image File
          </label>
          <input
            type="file"
            accept="image/*"
            disabled={submitting}
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Content body <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            required
            rows="8"
            disabled={submitting}
            placeholder="Start drafting your chronicles here..."
            value={form.content}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Updating Article...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}
