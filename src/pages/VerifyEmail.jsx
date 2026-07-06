import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { backendApi } from "../api/axiosInstance";

export default function VerifyEmail() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  const token = params.token || searchParams.get("token");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing email verification token.");
        return;
      }

      try {
        const res = await backendApi.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(res.message || "Your email address has been successfully verified! You can now log in.");
      } catch (err) {
        console.error("Email verification failed:", err);
        const errMessage = err.response?.data?.message || err.message || "The verification link is invalid or has expired.";
        setStatus("error");
        setMessage(errMessage);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12 px-4 animate-fade">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl text-center space-y-6">
        <h2 className="text-3xl font-bold text-slate-900">
          Email Verification
        </h2>

        {status === "loading" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-slate-600 text-sm">Verifying your email address, please wait...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-green-700 text-base">{message}</p>
            <Link to="/login" className="inline-block w-full btn-primary py-3 text-base font-semibold text-center">
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <p className="text-red-700 text-base">{message}</p>
            <Link to="/register" className="inline-block w-full btn-primary py-3 text-base font-semibold text-center">
              Register Again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
