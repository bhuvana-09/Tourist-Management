import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { backendApi as api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const bookingValidationSchema = z.object({
  packageId: z.string().min(1, "Please select a travel package"),
  phone: z.string().min(1, "Phone number is required"),
  travelers: z.coerce
    .number()
    .min(1, "At least 1 traveler is required")
    .max(20, "Maximum of 20 travelers allowed"),
  date: z.string().min(1, "Travel date is required").refine((val) => {
    const selectedDate = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, "Travel date cannot be in the past")
});

export default function AddBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(bookingValidationSchema),
    defaultValues: {
      packageId: "",
      phone: "",
      travelers: 1,
      date: ""
    }
  });

  useEffect(() => {
    // Fetch packages to populate checkout dropdown selection
    api.get("/packages")
      .then((res) => {
        setPackages(res || []);
      })
      .catch((err) => {
        console.error("Failed to load packages:", err);
      });
  }, []);

  const onSubmit = (data) => {
    setError("");
    setLoading(true);

    api.post("/bookings", data)
      .then(() => {
        alert("Booking created successfully!");
        navigate("/my-bookings");
      })
      .catch((err) => {
        console.error("Failed to create booking:", err);
        setError(err.response?.data?.message || err.message || "Failed to create booking");
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
            Book Your Trip
          </h1>
          <p className="text-slate-600">
            Fill in the details below to secure your travel booking
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          {/* Read-Only Account Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Passenger Name</span>
              <span className="text-slate-800 font-semibold">{user?.name}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</span>
              <span className="text-slate-800 font-semibold">{user?.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Package <span className="text-red-500">*</span>
            </label>
            <select
              {...register("packageId")}
              className={`input-field ${errors.packageId ? "border-red-500" : ""}`}
              disabled={loading}
            >
              <option value="">Choose a travel package...</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.packageName} - ₹{p.price}
                </option>
              ))}
            </select>
            {errors.packageId && (
              <p className="text-red-500 text-xs mt-1">{errors.packageId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Contact Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="e.g., +91 98765 43210"
              {...register("phone")}
              className={`input-field ${errors.phone ? "border-red-500" : ""}`}
              disabled={loading}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Number of Travelers <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                placeholder="1"
                {...register("travelers")}
                className={`input-field ${errors.travelers ? "border-red-500" : ""}`}
                disabled={loading}
              />
              {errors.travelers && (
                <p className="text-red-500 text-xs mt-1">{errors.travelers.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Travel Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("date")}
                className={`input-field ${errors.date ? "border-red-500" : ""}`}
                disabled={loading}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
              )}
            </div>
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
                  Processing Checkout...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm Booking
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
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
