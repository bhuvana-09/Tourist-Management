import React, { useState } from "react";
import { backendApi as api } from "../api/axiosInstance";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const validate = () => {
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = "Name is required";
    
    if (!email.trim()) {
      tempErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        tempErrors.email = "Provide a valid email address";
      }
    }

    if (!message.trim()) tempErrors.message = "Message content is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrors({});

    if (!validate()) return;

    try {
      setLoading(true);
      const res = await api.post("/contact", { name, email, message });
      setSuccessMsg(res.message || "Message sent successfully!");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("Contact form error:", err);
      const serverMsg = err.response?.data?.message || "Failed to submit request. Please try again.";
      setErrors({ server: serverMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell max-w-2xl mx-auto py-12 space-y-8 animate-fade">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          Support desk
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact Us
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto">
          Have queries or feedback? Drop us a note below and our administrative team will reach out.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg">
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 mb-6 text-sm font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {successMsg}
          </div>
        )}

        {errors.server && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 mb-6 text-sm font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.server}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              placeholder="Your full name"
              className={`w-full px-4 py-3 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.name
                  ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                  : "border-slate-200 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs font-semibold">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.email
                  ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                  : "border-slate-200 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs font-semibold">{errors.email}</p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Message
            </label>
            <textarea
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              placeholder="Tell us what you need help with..."
              className={`w-full px-4 py-3 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.message
                  ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                  : "border-slate-200 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
            {errors.message && (
              <p className="text-red-500 text-xs font-semibold">{errors.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending Message...
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
