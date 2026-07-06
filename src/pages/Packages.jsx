import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { backendApi as api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

export default function Packages() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [packagesData, setPackagesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const placeholder =
    "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=800";

  // Map package names (or keywords) to aesthetic images
  const packageImages = {
    Goa:
      "https://i.pinimg.com/1200x/fe/c0/fb/fec0fb1c9a2a70f4812e3fe9ddc88d86.jpg?auto=compress&cs=tinysrgb&w=800",
    Manali:
      "https://i.pinimg.com/736x/3b/63/dd/3b63ddf2669995dbf1c15427b12be05d.jpg?auto=compress&cs=tinysrgb&w=800",
    Jaipur:
      "https://i.pinimg.com/736x/27/13/f9/2713f93dd73a878e461f2972ac2be3c4.jpg?auto=compress&cs=tinysrgb&w=800",
    Kerala:
      "https://i.pinimg.com/1200x/44/61/a6/4461a623d57bbebdce6729d66c6763e3.jpg?auto=compress&cs=tinysrgb&w=800",
    Delhi:
      "https://i.pinimg.com/1200x/dc/b0/64/dcb064d2adb85ca6cc82a7be246b7c5e.jpg?auto=compress&cs=tinysrgb&w=800",
    Rishikesh:
      "https://i.pinimg.com/1200x/83/a4/06/83a406be7e39f5e65b494fb24ec43860.jpg?auto=compress&cs=tinysrgb&w=800",
    Ladakh:
      "https://i.pinimg.com/1200x/1e/28/6b/1e286b8be6d5c9b9fac1945e2b40ee9e.jpg?auto=compress&cs=tinysrgb&w=800",
    Mumbai:
      "https://i.pinimg.com/1200x/c2/f6/eb/c2f6eba762a8d3f78ef008f54e44cfbd.jpg?auto=compress&cs=tinysrgb&w=800",
    Darjeeling:
      "https://i.pinimg.com/736x/be/fa/e5/befae5e5fede249e395d76ef8417da3b.jpg?auto=compress&cs=tinysrgb&w=800",
    Shimla:
      "https://i.pinimg.com/736x/8f/a5/d0/8fa5d04296fcff336724f92e1d433a0c.jpg?auto=compress&cs=tinysrgb&w=800",
    Udaipur:
      "https://i.pinimg.com/736x/c2/96/ab/c296ab3c7ba4123b0d7cb990261e9df1.jpg?auto=compress&cs=tinysrgb&w=800",
  };

  const getPackageImage = (pkg) => {
    if (pkg.image && typeof pkg.image === "string" && pkg.image.trim() !== "") {
      return pkg.image;
    }
    const name = pkg.packageName || "";
    const matchKey =
      Object.keys(packageImages).find((key) =>
        name.toLowerCase().includes(key.toLowerCase())
      ) || null;

    return (matchKey && packageImages[matchKey]) || placeholder;
  };

  const fetchPackages = () => {
    setLoading(true);
    api.get("/packages")
      .then((res) => {
        setPackagesData(res || []);
      })
      .catch((err) => {
        console.error("Fetch packages failed:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const deletePackage = async (id) => {
    try {
      await api.delete(`/packages/${id}`);
      fetchPackages();
    } catch (err) {
      console.error("Failed to delete package:", err);
      alert("Failed to delete package");
    }
  };

  return (
    <div className="page-shell space-y-8 animate-fade">
      {/* Header Section */}
      <div className="text-center space-y-3 py-6">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
          Best Holiday Packages
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
          Travel Packages
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          Curated travel experiences combining destinations, stays, and activities
        </p>
      </div>

      {/* Action Bar */}
      {isAdmin && (
        <div className="flex justify-end">
          <Link
            to="/packages/add"
            className="inline-flex items-center gap-2 btn-primary px-6 py-3 text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Package
          </Link>
        </div>
      )}

      {/* Packages Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : packagesData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-800">No packages found</p>
          <p className="text-sm text-slate-500 mt-1">Create your first travel package</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {packagesData.map((pkg, index) => (
            <div
              key={pkg.id}
              className="animate-scale-in rounded-2xl bg-white shadow-lg overflow-hidden card-hover"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={getPackageImage(pkg)}
                  alt={pkg.packageName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = placeholder;
                  }}
                />
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 text-xs font-semibold text-slate-900 shadow-sm">
                    {pkg.duration || "N/A"}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {pkg.packageName}
                  </h2>
                  <p className="text-sm font-semibold text-blue-600 mt-1">
                    {pkg.destinationId?.name || "Unassigned"}
                  </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    ₹{pkg.price}
                  </span>
                  <span className="text-xs text-slate-500">per person</span>
                </div>

                <p className="text-sm text-slate-700 line-clamp-2">
                  {pkg.description}
                </p>

                {/* Action Buttons */}
                {isAdmin && (
                  <div className="flex gap-3 pt-2">
                    <Link
                      to={`/packages/edit/${pkg.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 btn-secondary text-sm py-2.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>

                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${pkg.packageName}?`)) {
                          deletePackage(pkg.id);
                        }
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 btn-danger text-sm py-2.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      )}
    </div>
  );
}
