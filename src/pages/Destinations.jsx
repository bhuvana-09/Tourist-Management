import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { backendApi as api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

export default function Destinations() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    api.get("/destinations").then((res) => setDestinations(res.data));
  }, []);

  const deleteDestination = async (id) => {
    await api.delete(`/destinations/${id}`);
    const updated = await api.get("/destinations");
    setDestinations(updated.data);
  };

  //  Fallback placeholder image
  const placeholder =
    "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=800";

  // Local map of images per destination name
  const destinationImages = {
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

  const getDestinationImage = (dest) => {
    // 1) If user has set a custom image URL, always respect that
    if (dest.image && typeof dest.image === "string" && dest.image.trim() !== "") {
      return dest.image;
    }
    // 2) Otherwise fall back to our curated image map
    return destinationImages[dest.name] || placeholder;
  };

  return (
    <div className="page-shell space-y-8 animate-fade">
      {/* Header Section */}
      <div className="text-center space-y-3 py-6">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
          Explore Amazing Places
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
          Destinations
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          Discover and manage beautiful tourist destinations from around the world
        </p>
      </div>

      {/* Action Bar - Only visible to Admins */}
      {isAdmin && (
        <div className="flex justify-end">
          <Link
            to="/destinations/add"
            className="inline-flex items-center gap-2 btn-primary px-6 py-3 text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Destination
          </Link>
        </div>
      )}

      {/* Destinations Grid */}
      {destinations.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-700">No destinations found</p>
          <p className="text-sm text-slate-500 mt-1">Add your first destination to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest, index) => (
            <div
              key={dest.id}
              className="animate-scale-in rounded-2xl bg-white shadow-lg overflow-hidden card-hover"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={getDestinationImage(dest)}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = placeholder;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-xl font-bold text-white drop-shadow-lg">
                    {dest.name}
                  </h2>
                  <p className="text-sm text-blue-100 mt-1">
                    {dest.location}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-700 line-clamp-3">
                  {dest.description}
                </p>

                {/* Action Buttons - Only visible to Admins */}
                {isAdmin && (
                  <div className="flex gap-3 pt-2">
                    <Link
                      to={`/destinations/edit/${dest.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 btn-secondary text-sm py-2.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>

                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${dest.name}?`)) {
                          deleteDestination(dest.id);
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
