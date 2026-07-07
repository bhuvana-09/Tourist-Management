import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { backendApi as api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import WishlistButton from "../components/WishlistButton";

export default function Destinations() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ totalCount: 0, page: 1, totalPages: 1 });

  // Query parameter states
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);

  // Curated tags helper list for quick filters
  const quickTags = ["beach", "adventure", "culture", "nature", "budget", "luxury"];

  const fetchDestinations = () => {
    setLoading(true);
    const params = {
      search: search || undefined,
      location: location || undefined,
      tags: tags || undefined,
      sortBy: sortBy || undefined,
      order: order || undefined,
      page,
      limit: 6
    };

    api.get("/destinations", { params })
      .then((res) => {
        // res is unwrapped to the { success, data, meta } payload
        // Wait! Let's double check if backendApi unwrap intercepts correct
        // Our interceptor does:
        // if (response.data && response.data.success === true && response.data.data !== undefined) {
        //   response.data = response.data.data;
        // }
        // Wait! In Sprint 6, we returned:
        // res.status(200).json({ success: true, data: destinations, meta: { totalCount, page, totalPages } })
        // But the interceptor only checks if response.data.data is defined and replaces response.data = response.data.data!
        // In this case, `res` will be just the `destinations` array, and the `meta` object will be LOST since it is a sibling to `data`!
        // Ah! That is a CRITICAL mismatch!
        // Let's examine:
        // If response.data is:
        // { success: true, data: destinations, meta: { ... } }
        // The interceptor overwrites response.data with response.data.data!
        // So the controller's return is stripped of meta!
        // Wait, how do we fix this?
        // We can either bypass the unwrapper inside `fetchDestinations` by accessing the raw response,
        // or we can adjust the interceptor, OR we can return { destinations, meta } inside `data` field of controller!
        // Wait, the prompt says:
        // "returns { success: true, data: [...], meta: { totalCount, page, totalPages } }"
        // Yes, so it MUST return `meta` at the root!
        // To bypass the interceptor or preserve `meta`, we can modify the interceptor in `axiosInstance.js` to preserve `meta` if it exists!
        // Let's check:
        // If we change the interceptor to:
        // if (response.data && response.data.success === true && response.data.data !== undefined) {
        //   if (response.data.meta !== undefined) {
        //     response.data = { data: response.data.data, meta: response.data.meta };
        //   } else {
        //     response.data = response.data.data;
        //   }
        // }
        // That is extremely clever! It prevents stripping the metadata while keeping simple data unwrapping completely intact for other endpoints!
        // Let's also verify this: yes! That preserves the `res.data` for getDestinations to be `{ data: destinations, meta: { totalCount, page, totalPages } }`, and for other endpoints it remains just the payload directly.
        // Let's review if that works: if there's no `meta`, it unwraps `data` directly. If there is `meta`, it returns `{ data, meta }`.
        // Let's write this update to `axiosInstance.js`!
      });
  };

  // Wait, let's write fetchDestinations assuming we retrieve { data: destinations, meta }
  // from our adjusted Axios instance. Let's make sure it handles both.
  const handleFetch = () => {
    setLoading(true);
    const params = {
      search: search || undefined,
      location: location || undefined,
      tags: tags || undefined,
      sortBy: sortBy || undefined,
      order: order || undefined,
      page,
      limit: 6
    };

    api.get("/destinations", { params })
      .then((res) => {
        // If interceptor returned { data, meta }
        if (res.meta !== undefined) {
          setDestinations(res.data || []);
          setMeta(res.meta);
        } else {
          // Fallback if it was unwrapped to just data
          setDestinations(res || []);
          setMeta({ totalCount: res.length || 0, page: 1, totalPages: 1 });
        }
      })
      .catch((err) => {
        console.error("Fetch destinations failed:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    handleFetch();
  }, [search, location, tags, sortBy, order, page]);

  const deleteDestination = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.delete(`/destinations/${id}`);
        handleFetch();
      } catch (err) {
        console.error("Failed to delete destination:", err);
        alert("Failed to delete destination");
      }
    }
  };

  const toggleTag = (tag) => {
    if (tags === tag) {
      setTags(""); // Clear if clicked again
    } else {
      setTags(tag);
      setPage(1);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    handleFetch();
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === "name-asc") {
      setSortBy("name");
      setOrder("asc");
    } else if (val === "name-desc") {
      setSortBy("name");
      setOrder("desc");
    } else {
      setSortBy("createdAt");
      setOrder("desc");
    }
    setPage(1);
  };

  // Fallback placeholder image
  const placeholder =
    "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=800";

  return (
    <div className="page-shell space-y-8 animate-fade">
      {/* Header Section */}
      <div className="text-center space-y-3 py-6">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
          Explore Amazing Places
        </p>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explore Destinations
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Discover breathtaking places, cities, and nature reserves around the globe.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/destinations/add"
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl shadow-md text-sm font-bold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Destination
          </Link>
        )}
      </div>

      {/* Query Filter panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="absolute left-3 top-3 h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>

        {/* Location Filter */}
        <div>
          <input
            type="text"
            className="input-field"
            placeholder="Filter by location..."
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Sort Dropdown */}
        <div>
          <select
            className="input-field py-[10px]"
            onChange={handleSortChange}
            defaultValue="createdAt-desc"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Quick Tag Pills */}
      <div className="flex flex-wrap gap-2 items-center justify-center">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 mr-2">Quick Tags:</span>
        {quickTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
              tags === tag
                ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-700 shadow-md scale-105"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:border-slate-700"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : destinations.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 mb-4">
            <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">No destinations match your filters</p>
          <p className="text-sm text-slate-500 dark:text-slate-450 mt-1">Try resetting search query or tag options</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((dest, index) => (
              <div
                key={dest.id}
                className="animate-scale-in rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-lg overflow-hidden card-hover flex flex-col justify-between relative"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Wishlist Button Overlay */}
                <div className="absolute top-4 right-4 z-10">
                  <WishlistButton destinationId={dest.id} />
                </div>
                <div>
                  {/* Image Link */}
                  <Link to={`/destinations/${dest.id}`} className="block relative h-64 overflow-hidden group">
                    <img
                      src={dest.images && dest.images[0]?.url ? dest.images[0].url : placeholder}
                      alt={dest.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = placeholder;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-xl font-bold text-white drop-shadow-lg group-hover:text-blue-200 transition-colors">
                        {dest.name}
                      </h2>
                      <p className="text-sm text-blue-100 dark:text-slate-300 mt-1">
                        {dest.location}
                      </p>
                    </div>
                  </Link>

                  <div className="p-6 space-y-4">
                    {/* Rating Section */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" />
                      </svg>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{dest.avgRating !== undefined ? dest.avgRating : 0}</span>
                      <span>({dest.reviewCount !== undefined ? dest.reviewCount : 0} {dest.reviewCount === 1 ? 'review' : 'reviews'})</span>
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                      {dest.description}
                    </p>

                    {/* Render tags if present */}
                    {dest.tags && dest.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {dest.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300 tracking-wider">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 space-y-3">
                  {/* Public Details button */}
                  <Link
                    to={`/destinations/${dest.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 btn-secondary text-sm py-2.5"
                  >
                    View Details
                  </Link>

                  {/* Action Buttons - Only visible to Admins */}
                  {isAdmin && (
                    <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        to={`/destinations/edit/${dest.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 btn-secondary text-sm py-2"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>

                      <button
                        onClick={() => deleteDestination(dest.id, dest.name)}
                        className="flex-1 inline-flex items-center justify-center gap-2 btn-danger text-sm py-2"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="btn-secondary py-2 px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Page {meta.page} of {meta.totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
                disabled={page === meta.totalPages}
                className="btn-secondary py-2 px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
