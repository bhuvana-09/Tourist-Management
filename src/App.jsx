import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AIChatWidget from "./components/AIChatWidget";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Lazy-loaded page components for bundle size optimizations
const Home = lazy(() => import("./pages/Home"));
const Destinations = lazy(() => import("./pages/Destinations"));
const DestinationDetail = lazy(() => import("./pages/DestinationDetail"));
const Packages = lazy(() => import("./pages/Packages"));
const Itineraries = lazy(() => import("./pages/Itineraries"));
const Bookings = lazy(() => import("./pages/Bookings"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const AdminCoupons = lazy(() => import("./pages/AdminCoupons"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AddBooking = lazy(() => import("./pages/AddBooking"));
const AddDestination = lazy(() => import("./pages/AddDestination"));
const AddPackage = lazy(() => import("./pages/AddPackage"));
const AddItinerary = lazy(() => import("./pages/AddItinerary"));
const EditDestination = lazy(() => import("./pages/EditDestination"));
const EditPackage = lazy(() => import("./pages/EditPackage"));
const EditItinerary = lazy(() => import("./pages/EditItinerary"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const AddBlog = lazy(() => import("./pages/AddBlog"));
const EditBlog = lazy(() => import("./pages/EditBlog"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));

import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-xl focus:font-bold focus:shadow-lg focus:outline-none">
              Skip to Content
            </a>
            <Navbar />
          
          <main id="main-content" className="flex-grow">
            <Suspense fallback={
              <div className="flex justify-center items-center py-20 min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            }>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/destinations" element={<ProtectedRoute><Destinations /></ProtectedRoute>} />
                <Route path="/destinations/:id" element={<ProtectedRoute><DestinationDetail /></ProtectedRoute>} />
                <Route path="/packages" element={<ProtectedRoute><Packages /></ProtectedRoute>} />
                <Route path="/itineraries" element={<ProtectedRoute><Itineraries /></ProtectedRoute>} />
                <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
                <Route path="/bookings/me" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                <Route path="/bookings/add" element={<ProtectedRoute><AddBooking /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                
                {/* Public blogs, FAQ, and contact routes */}
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/blogs/:id" element={<BlogDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />

                {/* Admin-only routes */}
                <Route path="/admin/coupons" element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminCoupons />
                  </ProtectedRoute>
                } />
                <Route path="/admin/analytics" element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/destinations/add" element={
                  <ProtectedRoute roles={["admin"]}>
                    <AddDestination />
                  </ProtectedRoute>
                } />
                <Route path="/destinations/edit/:id" element={
                  <ProtectedRoute roles={["admin"]}>
                    <EditDestination />
                  </ProtectedRoute>
                } />
                <Route path="/packages/add" element={
                  <ProtectedRoute roles={["admin"]}>
                    <AddPackage />
                  </ProtectedRoute>
                } />
                <Route path="/packages/edit/:id" element={
                  <ProtectedRoute roles={["admin"]}>
                    <EditPackage />
                  </ProtectedRoute>
                } />
                <Route path="/itineraries/add" element={
                  <ProtectedRoute roles={["admin"]}>
                    <AddItinerary />
                  </ProtectedRoute>
                } />
                <Route path="/itineraries/edit/:id" element={
                  <ProtectedRoute roles={["admin"]}>
                    <EditItinerary />
                  </ProtectedRoute>
                } />

                {/* Admin-only blog write routes */}
                <Route path="/blogs/add" element={
                  <ProtectedRoute roles={["admin"]}>
                    <AddBlog />
                  </ProtectedRoute>
                } />
                <Route path="/blogs/edit/:id" element={
                  <ProtectedRoute roles={["admin"]}>
                    <EditBlog />
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </main>

          <Footer />
          <AIChatWidget />
        </div>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
  );
}