import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { backendApi as api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

export default function Blogs() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const placeholder = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800";

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 6,
        search: search || undefined,
        tags: selectedTag || undefined
      };
      const res = await api.get("/blogs", { params });
      setBlogs(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, selectedTag]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs();
  };

  // Collect some unique tags from current blogs for filter pills
  const availableTags = ["Travel", "Adventure", "Guides", "Sightseeing", "Tips"];

  return (
    <div className="page-shell space-y-10 animate-fade pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Traveler Chronicles
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Guides, stories, and sightseeing insights written by expert guides.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/blogs/add"
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl shadow-md text-sm font-bold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Blog Post
          </Link>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Tags list */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => { setSelectedTag(""); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              !selectedTag
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Tags
          </button>
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => { setSelectedTag(tag); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedTag === tag
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 text-sm mt-4">Loading blogs...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-500 font-semibold">No blog articles match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((b, idx) => (
            <article
              key={b.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
            >
              <div>
                {/* Cover Image */}
                <Link to={`/blogs/${b.id}`} className="block h-48 overflow-hidden relative">
                  <img
                    src={b.coverImage?.url || placeholder}
                    alt={b.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex gap-1.5">
                    {b.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-black/40 backdrop-blur text-white font-bold rounded-full text-[9px] uppercase tracking-wider">
                        {t}
                      </span>
                    ))}
                  </div>
                </Link>

                <div className="p-6 space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    {new Date(b.createdAt).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                  <Link to={`/blogs/${b.id}`} className="block">
                    <h2 className="text-lg font-extrabold text-slate-900 leading-tight hover:text-blue-600 transition-colors">
                      {b.title}
                    </h2>
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {b.content}
                  </p>
                </div>
              </div>

              {/* Author Footer */}
              <div className="p-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  By {b.authorId?.name || "Portal Admin"}
                </span>
                <Link
                  to={`/blogs/${b.id}`}
                  className="text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Read More
                  <span>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
