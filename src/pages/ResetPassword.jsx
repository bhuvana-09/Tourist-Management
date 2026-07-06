import { useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { backendApi } from "../api/axiosInstance";

export default function ResetPassword() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const token = params.token || searchParams.get("token");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      return setError("Invalid or missing reset token.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    try {
      const res = await backendApi.post(`/auth/reset-password/${token}`, { password });
      setSuccess(res.message || "Your password has been successfully reset!");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Password reset failed:", err);
      const errMessage = err.response?.data?.message || err.message || "Failed to reset password. The link may have expired.";
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12 px-4 animate-fade">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleResetPassword}
          className="bg-white p-8 rounded-2xl shadow-2xl space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">
              New Password
            </h2>
            <p className="text-sm text-slate-600">
              Create a new secure password for your account
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter new password"
                required
                disabled={loading || !!success}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Re-enter new password"
                required
                disabled={loading || !!success}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success} Redirecting to login in 3 seconds...
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3 text-base font-semibold"
            disabled={loading || !!success}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Resetting...
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
