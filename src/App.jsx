import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import Packages from "./pages/Packages";
import Itineraries from "./pages/Itineraries";
import Bookings from "./pages/Bookings";
import MyBookings from "./pages/MyBookings";
import AdminCoupons from "./pages/AdminCoupons";
import AddBooking from "./pages/AddBooking";
import AddDestination from "./pages/AddDestination";
import AddPackage from "./pages/AddPackage";
import AddItinerary from "./pages/AddItinerary";
import EditDestination from "./pages/EditDestination";
import EditPackage from "./pages/EditPackage";
import EditItinerary from "./pages/EditItinerary";

import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          
          <main className="flex-grow">
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
              
              {/* Write Destination routes gated for admin role only */}
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

              <Route path="/packages" element={<ProtectedRoute><Packages /></ProtectedRoute>} />
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

              <Route path="/itineraries" element={<ProtectedRoute><Itineraries /></ProtectedRoute>} />
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

              {/* Bookings routes: All Bookings (Admin list), checkout (authenticated), history (authenticated) */}
              <Route path="/bookings" element={
                <ProtectedRoute roles={["admin"]}>
                  <Bookings />
                </ProtectedRoute>
              } />
              <Route path="/bookings/add" element={<ProtectedRoute><AddBooking /></ProtectedRoute>} />
              <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
              <Route path="/admin/coupons" element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminCoupons />
                </ProtectedRoute>
              } />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}