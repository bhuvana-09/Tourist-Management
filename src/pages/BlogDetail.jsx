import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { backendApi as api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/blogs/${id}`);
      setBlog(res);
    } catch (err) {
      console.error("Failed to load blog article:", err);
      alert("Failed to load blog post. It may have been deleted.");
      navigate("/blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      await api.delete(`/blogs/${id}`);
      alert("Blog post deleted successfully!");
      navigate("/blogs");
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Failed to delete blog post.");
    }
  };

  if (loading) {
    return (
      <div className="page-shell flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 text-sm mt-4">Loading article details...</p>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="page-shell max-w-4xl mx-auto py-12 space-y-8 animate-fade">
      {/* Navigation & Action Bar */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <Link
          to="/blogs"
          className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1.5"
        >
          ← Back to Chronicles
        </Link>

        {isAdmin && (
          <div className="flex gap-2">
            <Link
              to={`/blogs/edit/${id}`}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              Edit Post
            </Link>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-all"
            >
              Delete Post
            </button>
          </div>
        )}
      </div>

      {/* Meta Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {blog.tags.map(t => (
            <span key={t} className="px-2.5 py-1 bg-blue-50 text-blue-600 font-bold rounded-full text-[10px] uppercase tracking-wider">
              #{t}
            </span>
          ))}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {blog.title}
        </h1>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-bold text-slate-700">By {blog.authorId?.name || "Portal Admin"}</span>
          <span className="text-slate-300">•</span>
          <span>
            {new Date(blog.createdAt).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric"
            })}
          </span>
        </div>
      </div>

      {/* Cover Image */}
      {blog.coverImage?.url && (
        <div className="aspect-[21/9] w-full rounded-3xl overflow-hidden bg-slate-100 shadow-sm">
          <img
            src={blog.coverImage.url}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="prose max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
        {blog.content}
      </div>
    </div>
  );
}
