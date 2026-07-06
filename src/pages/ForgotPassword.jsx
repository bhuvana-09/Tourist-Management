import { useState } from "react";
import { Link } from "react-router-dom";
import { backendApi } from "../api/axiosInstance";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await backendApi.post("/auth/forgot-password", { email });
      setMessage(res.message || "If that email address exists, we have sent a password reset link to it.");
    } catch (err) {
      console.error("Forgot password request failed:", err);
      const errMessage = err.response?.data?.message || err.message || "Something went wrong. Please try again.";
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12 px-4 animate-fade">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleForgotPassword}
          className="bg-white p-8 rounded-2xl shadow-2xl space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">
              Reset Password
            </h2>
            <p className="text-sm text-slate-600">
              Enter your email to receive a password reset link
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your registered email"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3 text-base font-semibold"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending Link...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <p className="text-sm text-center text-slate-600">
            Remember your password?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
