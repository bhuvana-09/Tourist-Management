import React, { useState, useEffect, useRef } from "react";
import { backendApi as api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications/me");
      // res is unwrapped to the array inside data field by our interceptor
      setNotifications(res || []);
    } catch (err) {
      console.error("Failed to load notifications:", err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 45 seconds to keep notifications synced silently in the background
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [user]);

  // Click away listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.error("Failed to mark notification as read:", err.message);
      fetchNotifications(); // Rollback/refetch
    }
  };

  const handleMarkAllRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await api.patch("/notifications/read-all");
    } catch (err) {
      console.error("Failed to mark all as read:", err.message);
      fetchNotifications();
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all duration-200 focus:outline-none"
        title="Notifications"
      >
        <svg
          className="w-5.5 h-5.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold leading-none text-white bg-rose-500 transform translate-x-1/3 -translate-y-1/3 border border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100/90 py-2 z-50 animate-scale-in origin-top-right">
          <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wide">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                You have no notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={(e) => !notif.isRead && handleMarkRead(notif.id, e)}
                  className={`p-4 flex gap-3 text-left transition-colors duration-150 cursor-pointer ${
                    notif.isRead
                      ? "bg-white hover:bg-slate-50/50"
                      : "bg-blue-50/20 hover:bg-blue-50/35 border-l-2 border-blue-500"
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-slate-650 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={(e) => handleMarkRead(notif.id, e)}
                      className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-1"
                      title="Mark as read"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
