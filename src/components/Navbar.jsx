import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const [open, setOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1 rounded-full text-sm font-medium transition-colors ${
      isActive
        ? "bg-white/90 text-blue-700 shadow-sm"
        : "text-blue-50 hover:bg-blue-500/70"
    }`;

  return (
    <nav className="fixed inset-x-0 top-0 z-30 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-700 text-white shadow-lg backdrop-blur animate-fade">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-blue-700 text-sm font-bold shadow">
            TM
          </span>
          <span className="text-sm font-semibold sm:text-base">
            Tourist Management
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {isLoggedIn && (
            <div className="flex items-center gap-1 rounded-full bg-blue-800/60 px-2 py-1">
              <NavLink to="/" className={navLinkClass} end>
                Home
              </NavLink>
              <NavLink to="/destinations" className={navLinkClass}>
                Destinations
              </NavLink>
              <NavLink to="/packages" className={navLinkClass}>
                Packages
              </NavLink>
              <NavLink to="/itineraries" className={navLinkClass}>
                Itineraries
              </NavLink>
              <NavLink to="/my-bookings" className={navLinkClass}>
                My Bookings
              </NavLink>
              {user?.role === "admin" && (
                <>
                  <NavLink to="/bookings" className={navLinkClass}>
                    Bookings
                  </NavLink>
                  <NavLink to="/admin/coupons" className={navLinkClass}>
                    Coupons
                  </NavLink>
                </>
              )}
            </div>
          )}

          {isLoggedIn ? (
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md bg-white/10 p-2 text-white hover:bg-white/20 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="sr-only">Toggle navigation</span>
          <div className="space-y-1">
            <span className="block h-0.5 w-5 bg-white"></span>
            <span className="block h-0.5 w-5 bg-white"></span>
            <span className="block h-0.5 w-5 bg-white"></span>
          </div>
        </button>
      </div>

      {/* Mobile nav */}
      {isLoggedIn && open && (
        <div className="md:hidden animate-slide-up">
          <div className="space-y-1 border-t border-white/10 bg-blue-900/90 px-4 py-3">
            <NavLink
              to="/"
              end
              className={navLinkClass}
              onClick={() => setOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/destinations"
              className={navLinkClass}
              onClick={() => setOpen(false)}
            >
              Destinations
            </NavLink>
            <NavLink
              to="/packages"
              className={navLinkClass}
              onClick={() => setOpen(false)}
            >
              Packages
            </NavLink>
            <NavLink
              to="/itineraries"
              className={navLinkClass}
              onClick={() => setOpen(false)}
            >
              Itineraries
            </NavLink>
            <NavLink
              to="/my-bookings"
              className={navLinkClass}
              onClick={() => setOpen(false)}
            >
              My Bookings
            </NavLink>
            {user?.role === "admin" && (
              <>
                <NavLink
                  to="/bookings"
                  className={navLinkClass}
                  onClick={() => setOpen(false)}
                >
                  Bookings
                </NavLink>
                <NavLink
                  to="/admin/coupons"
                  className={navLinkClass}
                  onClick={() => setOpen(false)}
                >
                  Coupons
                </NavLink>
              </>
            )}

            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}