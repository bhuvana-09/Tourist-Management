import { useEffect, useState } from "react";
import { backendApi as api } from "../api/axiosInstance";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New coupon form fields
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/coupons");
      setCoupons(res || []);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
      setError("Failed to load coupons. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!code.trim()) return setFormError("Coupon code is required");
    if (!discountPercent || Number(discountPercent) < 0 || Number(discountPercent) > 100) {
      return setFormError("Discount percent must be between 0 and 100");
    }
    if (!expiryDate) return setFormError("Expiry date is required");
    if (!maxUses || Number(maxUses) < 1) {
      return setFormError("Max uses must be at least 1");
    }

    setCreating(true);

    try {
      await api.post("/coupons", {
        code: code.trim().toUpperCase(),
        discountPercent: Number(discountPercent),
        expiryDate: new Date(expiryDate).toISOString(),
        maxUses: Number(maxUses)
      });

      setFormSuccess("Coupon created successfully!");
      setCode("");
      setDiscountPercent("");
      setExpiryDate("");
      setMaxUses("");
      await fetchCoupons(); // Refresh the list
    } catch (err) {
      console.error("Failed to create coupon:", err);
      setFormError(err.response?.data?.message || "Failed to create coupon. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const getCouponStatusBadge = (coupon) => {
    const isExpired = new Date(coupon.expiryDate) < new Date();
    const isMaxedOut = coupon.usedCount >= coupon.maxUses;

    if (!coupon.isActive) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase">
          Inactive
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-150 uppercase">
          Expired
        </span>
      );
    }
    if (isMaxedOut) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-150 uppercase">
          Maxed Out
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-150 uppercase">
        Active
      </span>
    );
  };

  return (
    <div className="page-shell space-y-8 animate-fade">
      {/* Header */}
      <div className="text-center space-y-3 py-6">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
          Admin Portal
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
          Manage Coupons
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          Create, distribute, and audit coupon codes for package discounts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create Coupon Form */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-fit space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create New Coupon</h2>
            <p className="text-xs text-slate-500">Add a promo code to offer instant checkouts discount</p>
          </div>

          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Coupon Code *
              </label>
              <input
                type="text"
                placeholder="e.g., WINTER20"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input-field uppercase"
                disabled={creating}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Discount Percent (%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="20"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="input-field"
                disabled={creating}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Max Uses Limit *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="50"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="input-field"
                  disabled={creating}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="input-field"
                  disabled={creating}
                  required
                />
              </div>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs font-medium">
                {formSuccess}
              </div>
            )}

            <button
              type="submit"
              className="w-full btn-primary py-2.5 text-sm font-semibold"
              disabled={creating}
            >
              {creating ? "Creating Code..." : "Create Coupon"}
            </button>
          </form>
        </div>

        {/* Right Column: Coupons List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-100 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Active Coupons</h2>
              <p className="text-xs text-slate-500">Track and manage promo code performance and thresholds</p>
            </div>
            <button
              onClick={fetchCoupons}
              disabled={loading}
              className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-500 text-xs mt-2">Loading coupons...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {!loading && !error && coupons.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
              <p className="text-slate-500 text-sm">No coupons found. Create your first coupon using the panel on the left.</p>
            </div>
          ) : (
            !loading && !error && coupons.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm text-left">
                  <thead>
                    <tr className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="pb-3 pr-2">Code</th>
                      <th className="pb-3 px-2">Discount</th>
                      <th className="pb-3 px-2">Uses</th>
                      <th className="pb-3 px-2">Expires</th>
                      <th className="pb-3 pl-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coupons.map((c) => {
                      const expStr = new Date(c.expiryDate).toLocaleDateString();
                      return (
                        <tr key={c.id} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 pr-2 font-bold text-slate-900">{c.code}</td>
                          <td className="py-3 px-2 font-semibold text-blue-600">{c.discountPercent}% off</td>
                          <td className="py-3 px-2">
                            {c.usedCount} / <span className="text-slate-400">{c.maxUses}</span>
                          </td>
                          <td className="py-3 px-2">{expStr}</td>
                          <td className="py-3 pl-2 text-right">{getCouponStatusBadge(c)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
