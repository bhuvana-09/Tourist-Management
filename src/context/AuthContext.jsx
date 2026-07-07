/**
 * AuthContext Token Strategy:
 * 
 * 1. In-Memory Access Token:
 *    The access token is stored strictly in React state within the AuthContext. It is never stored in 
 *    localStorage or sessionStorage, which eliminates the threat of XSS attacks stealing the token.
 * 
 * 2. Silent Refresh on Mount:
 *    When the app mounts (e.g., page refresh or first load), a useEffect call triggers a refresh request 
 *    to `/api/auth/refresh`. Since the refresh token is stored in an httpOnly cookie, the browser sends it 
 *    automatically. On success, a new access token is returned and stored in memory, preserving the user session.
 * 
 * 3. Axios Token Synchronization:
 *    Once the access token is loaded/refreshed, we update the axiosInstance module variable using `setAuthToken`, 
 *    ensuring subsequent requests carry the token in their Authorization headers.
 */

import { createContext, useContext, useState, useEffect } from "react";
import { backendApi, setAuthToken } from "../api/axiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await backendApi.post("/auth/refresh");
        const token = res.accessToken; // backendApi interceptor unwraps success/data wrapper
        
        setAccessToken(token);
        setAuthToken(token);
        
        // Fetch current user details
        const meRes = await backendApi.get("/auth/me");
        setUser(meRes); // backendApi interceptor unwraps success/data wrapper

        // Fetch user's wishlist
        const wishlistRes = await backendApi.get("/users/me/wishlist");
        setWishlist(wishlistRes.map(item => item.id || item._id || item));
      } catch (error) {
        // Silent fail is expected if no cookie exists
        setUser(null);
        setAccessToken(null);
        setAuthToken(null);
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Listen to logout events from axios interceptors
  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setAccessToken(null);
      setAuthToken(null);
      setWishlist([]);
    };

    window.addEventListener("auth-logout", handleLogoutEvent);
    return () => window.removeEventListener("auth-logout", handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    const res = await backendApi.post("/auth/login", { email, password });
    const { accessToken: token, user: userData } = res;
    
    setAccessToken(token);
    setAuthToken(token);
    setUser(userData);

    try {
      const wishlistRes = await backendApi.get("/users/me/wishlist");
      setWishlist(wishlistRes.map(item => item.id || item._id || item));
    } catch (err) {
      console.error("Failed to load wishlist on login:", err.message);
    }

    return res;
  };

  const register = async (name, email, password) => {
    const res = await backendApi.post("/auth/register", { name, email, password });
    return res;
  };

  const logout = async () => {
    try {
      await backendApi.post("/auth/logout");
    } catch (e) {
      console.error("Logout request failed:", e.message);
    } finally {
      setUser(null);
      setAccessToken(null);
      setAuthToken(null);
      setWishlist([]);
    }
  };

  const toggleWishlist = async (destinationId) => {
    if (!user) return;
    const isFav = wishlist.includes(destinationId);
    try {
      if (isFav) {
        setWishlist(prev => prev.filter(id => id !== destinationId));
        await backendApi.delete(`/users/me/wishlist/${destinationId}`);
      } else {
        setWishlist(prev => [...prev, destinationId]);
        await backendApi.post(`/users/me/wishlist/${destinationId}`);
      }
    } catch (err) {
      console.error("Failed to toggle wishlist item:", err);
      // Rollback on error
      if (isFav) {
        setWishlist(prev => [...prev, destinationId]);
      } else {
        setWishlist(prev => prev.filter(id => id !== destinationId));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, wishlist, toggleWishlist, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
