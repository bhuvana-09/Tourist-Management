import React, { useState, useEffect } from "react";
import { backendApi as api } from "../api/axiosInstance";
import AnalyticsCard from "../components/AnalyticsCard";
import ChartWrapper from "../components/ChartWrapper";
import ExportButtonGroup from "../components/ExportButtonGroup";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

export default function AdminAnalytics() {
  // Date filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Forecast filters
  const [forecastType, setForecastType] = useState("revenue");
  const [forecastDays, setForecastDays] = useState(30);

  // Data states
  const [overview, setOverview] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    cancellationRate: 0,
    averageSpend: 0
  });
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [bookingsBreakdown, setBookingsBreakdown] = useState([]);
  const [topDestinations, setTopDestinations] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [peakSeason, setPeakSeason] = useState([]);

  // Forecast states
  const [forecastData, setForecastData] = useState([]);
  const [forecastStats, setForecastStats] = useState({
    slope: 0,
    intercept: 0,
    hasEnoughData: false
  });

  // Loading states
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoadingOverview(true);
      const params = {
        from: from || undefined,
        to: to || undefined
      };
      const res = await api.get("/analytics/overview", { params });
      setOverview(res || { totalBookings: 0, totalRevenue: 0, cancellationRate: 0, averageSpend: 0 });
    } catch (err) {
      console.error("Failed to load overview analytics:", err.message);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchChartsData = async () => {
    try {
      setLoadingCharts(true);
      const params = {
        from: from || undefined,
        to: to || undefined
      };

      const [revRes, bookRes, destRes, usersRes, peakRes] = await Promise.all([
        api.get("/analytics/revenue", { params }),
        api.get("/analytics/bookings", { params }),
        api.get("/analytics/destinations/top", { params }),
        api.get("/analytics/users/top", { params }),
        api.get("/analytics/peak-season")
      ]);

      setRevenueTrend(revRes || []);
      setBookingsBreakdown(bookRes || []);
      setTopDestinations(destRes || []);
      setTopUsers(usersRes || []);
      setPeakSeason(peakRes || []);
    } catch (err) {
      console.error("Failed to load charts analytics:", err.message);
    } finally {
      setLoadingCharts(false);
    }
  };

  const fetchForecast = async () => {
    try {
      setLoadingForecast(true);
      const res = await api.get("/analytics/forecast", {
        params: { type: forecastType, days: forecastDays }
      });

      if (res && res.history) {
        const history = res.history || [];
        const projection = res.projection || [];

        // Connect the projection line to the last history point
        const combined = [
          ...history.map((h, idx) => ({
            date: h.date,
            Historical: h.value,
            Projected: idx === history.length - 1 ? h.value : null
          })),
          ...projection.map(p => ({
            date: p.date,
            Historical: null,
            Projected: p.value
          }))
        ];

        setForecastData(combined);
        setForecastStats({
          slope: res.slope || 0,
          intercept: res.intercept || 0,
          hasEnoughData: res.hasEnoughData ?? false
        });
      }
    } catch (err) {
      console.error("Failed to load forecast analytics:", err.message);
    } finally {
      setLoadingForecast(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchChartsData();
  }, [from, to]);

  useEffect(() => {
    fetchForecast();
  }, [forecastType, forecastDays]);

  // Color constants
  const STATUS_COLORS = {
    pending: "#eab308", // Yellow
    confirmed: "#3b82f6", // Blue
    completed: "#10b981", // Green
    cancelled: "#ef4444" // Red
  };

  const DESTINATION_COLORS = ["#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81"];

  const handleResetFilters = () => {
    setFrom("");
    setTo("");
  };

  return (
    <div className="page-shell space-y-8 animate-fade pb-16">
      {/* Header & Date Pickers */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Portal Analytics
          </h1>
          <p className="text-sm text-slate-500">
            Real-time insights aggregated from active booking catalogs.
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-400">From</span>
            <input
              type="date"
              className="text-xs text-slate-700 bg-transparent border-none focus:outline-none focus:ring-0"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-400">To</span>
            <input
              type="date"
              className="text-xs text-slate-700 bg-transparent border-none focus:outline-none focus:ring-0"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          {(from || to) && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-700">Metrics Overview</h3>
          <ExportButtonGroup report="overview" from={from} to={to} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard
            title="Total Bookings"
            value={loadingOverview ? "..." : overview.totalBookings}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <AnalyticsCard
            title="Total Revenue"
            value={loadingOverview ? "..." : `$${overview.totalRevenue.toLocaleString()}`}
            trend="USD"
            trendType="neutral"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <AnalyticsCard
            title="Cancellation Rate"
            value={loadingOverview ? "..." : `${overview.cancellationRate}%`}
            trend={overview.cancellationRate > 20 ? "High" : "Optimal"}
            trendType={overview.cancellationRate > 20 ? "down" : "up"}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <AnalyticsCard
            title="Average Spend"
            value={loadingOverview ? "..." : `$${overview.averageSpend.toLocaleString()}`}
            trend="Per Booking"
            trendType="neutral"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Line Chart */}
        <div className="lg:col-span-2 relative">
          <div className="absolute top-6 right-6 z-10">
            <ExportButtonGroup report="revenue" from={from} to={to} />
          </div>
          <ChartWrapper title="Revenue & Bookings Trend" loading={loadingCharts}>
            {revenueTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No trend data found.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="period" stroke="#94a3b8" />
                  <YAxis yAxisId="left" stroke="#3b82f6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: "16px", borderColor: "#f1f5f9" }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="bookingsCount" name="Bookings Count" stroke="#94a3b8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartWrapper>
        </div>

        {/* Bookings Status Donut Chart */}
        <div className="relative">
          <div className="absolute top-6 right-6 z-10">
            <ExportButtonGroup report="bookings" from={from} to={to} />
          </div>
          <ChartWrapper title="Bookings by Status" loading={loadingCharts}>
            {bookingsBreakdown.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No status breakdown data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingsBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="status"
                  >
                    {bookingsBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "16px", borderColor: "#f1f5f9" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartWrapper>
        </div>

        {/* Top Destinations */}
        <div className="lg:col-span-2 relative">
          <div className="absolute top-6 right-6 z-10">
            <ExportButtonGroup report="destinations" from={from} to={to} />
          </div>
          <ChartWrapper title="Top Destinations (by Booking volume)" loading={loadingCharts}>
            {topDestinations.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No destination data found.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDestinations}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: "16px", borderColor: "#f1f5f9" }} />
                  <Bar dataKey="bookingsCount" name="Bookings Count" radius={[6, 6, 0, 0]}>
                    {topDestinations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DESTINATION_COLORS[index % DESTINATION_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartWrapper>
        </div>

        {/* Peak Season Months */}
        <div>
          <ChartWrapper title="Peak Travel Months" loading={loadingCharts}>
            {peakSeason.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No monthly metrics found.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakSeason}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: "16px", borderColor: "#f1f5f9" }} />
                  <Bar dataKey="bookingsCount" name="Travel Dates Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartWrapper>
        </div>
      </div>

      {/* Forecast Panel Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Predictive Demand Forecasting
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic least-squares linear projection of trailing 90 days volume.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <select
              value={forecastType}
              onChange={(e) => setForecastType(e.target.value)}
              className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="revenue">Revenue Projection</option>
              <option value="bookings">Bookings Projection</option>
            </select>

            <select
              value={forecastDays}
              onChange={(e) => setForecastDays(Number(e.target.value))}
              className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={30}>30 Days Forward</option>
              <option value={60}>60 Days Forward</option>
              <option value={90}>90 Days Forward</option>
            </select>
          </div>
        </div>

        {/* Caveat alert */}
        {!forecastStats.hasEnoughData && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex gap-3 items-start">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-xs space-y-1">
              <p className="font-bold">Caveat: Limited Historical Data</p>
              <p className="text-amber-700 leading-relaxed">
                A forecast based on fewer than 5 active transaction dates may show high sensitivity. The current slope coefficient is <span className="font-bold">{forecastStats.slope}</span>.
              </p>
            </div>
          </div>
        )}

        <div className="h-[280px] text-[11px] font-medium text-slate-400">
          {loadingForecast ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : forecastData.length === 0 ? (
            <div className="h-full flex items-center justify-center">No forecast series generated.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: "16px", borderColor: "#f1f5f9" }} />
                <Legend />
                <Line type="monotone" dataKey="Historical" name={`Actual ${forecastType === "revenue" ? "Revenue ($)" : "Bookings"}`} stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Projected" name={`Forecasted Trend`} stroke="#6366f1" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Paid Users Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-3 mb-4">
          Top Customers by Paid Spend
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Bookings count</th>
                <th className="py-3 px-4 text-right">Total Paid Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {loadingCharts ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">Loading top customers...</td>
                </tr>
              ) : topUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">No user data found.</td>
                </tr>
              ) : (
                topUsers.map((u, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{u.name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-4 text-center">{u.bookingsCount}</td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 font-bold">${u.totalPaidSpend.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
