import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AIRecommendationStrip from "../components/AIRecommendationStrip";

export default function Home() {
  const { isLoggedIn } = useAuth();
  return (
    <div className="page-shell space-y-16">
      {/* HERO SECTION WITH IMAGE */}
      <section className="relative overflow-hidden rounded-3xl shadow-2xl animate-fade">
        <div className="relative h-[400px] sm:h-[500px] lg:h-[600px]">
          <img
            src="https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Beautiful travel destination"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-transparent" />
          
          {/* Carousel dots */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <div className="w-2 h-2 rounded-full bg-white/50"></div>
            <div className="w-2 h-2 rounded-full bg-white/50"></div>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center z-10 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white space-y-6 max-w-3xl">
            <p className="text-sm sm:text-base font-semibold uppercase tracking-wider text-blue-100">
              WE ARE THE BEST
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold drop-shadow-lg">
              Tourist Management System
            </h1>
            <p className="text-base sm:text-lg text-blue-50 max-w-2xl mx-auto">
              Discover amazing destinations, explore travel packages, and plan your perfect trip with ease.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/destinations" className="btn-primary text-base px-8 py-3 animate-scale-in">
                Explore Destinations
              </Link>
              <Link to="/packages" className="btn-secondary text-base px-8 py-3 bg-white/90 hover:bg-white">
                View Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI RECOMMENDATION STRIP */}
      {isLoggedIn && <AIRecommendationStrip />}

      {/* BEST HOLIDAY PACKAGE SECTION */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            BEST HOLIDAY PACKAGE
          </h2>
          <p className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            WE ARE THE BEST
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/packages"
            className="group animate-fade rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg overflow-hidden card-hover animate-scale-in"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://i.pinimg.com/1200x/fe/c0/fb/fec0fb1c9a2a70f4812e3fe9ddc88d86.jpg"
                alt="Goa Package"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Goa, India</h3>
              <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">₹8,000</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">3 Days</p>
            </div>
          </Link>

          <Link
            to="/packages"
            className="group animate-fade rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg overflow-hidden card-hover"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://i.pinimg.com/736x/3b/63/dd/3b63ddf2669995dbf1c15427b12be05d.jpg"
                alt="Manali Package"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Manali, Himachal</h3>
              <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">₹12,000</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">4 Days</p>
            </div>
          </Link>

          <Link
            to="/packages"
            className="group animate-fade rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg overflow-hidden card-hover"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://i.pinimg.com/736x/27/13/f9/2713f93dd73a878e461f2972ac2be3c4.jpg"
                alt="Jaipur Package"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Jaipur, Rajasthan</h3>
              <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">₹9,000</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">3 Days</p>
            </div>
          </Link>
        </div>

        <div className="text-center pt-4">
          <Link to="/packages" className="btn-primary px-8 py-3">
            See more
          </Link>
        </div>
      </section>

      {/* ALL ABOUT US SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl">
          <img
            src="https://images.pexels.com/photos/1125976/pexels-photo-1125976.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="About us"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            WE ARE THE BEST
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            ALL ABOUT US
          </h2>
          <div className="space-y-3 text-sm sm:text-base text-slate-700 dark:text-slate-300">
            <p>
              Welcome to the Tourist Management System, your comprehensive platform for managing
              travel destinations, packages, and itineraries. We provide a seamless experience
              for planning and organizing memorable trips.
            </p>
            <p>
              Our system helps you discover amazing destinations, create curated travel packages,
              and manage detailed itineraries. Whether you&apos;re planning a beach vacation,
              mountain adventure, or cultural exploration, we have everything you need.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Manage Your Travel Data
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Everything you need in one place
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link
            to="/destinations"
            className="animate-fade rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-md card-hover text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Destinations</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Explore and manage beautiful tourist destinations with detailed information.
            </p>
          </Link>

          <Link
            to="/packages"
            className="animate-fade rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-md card-hover text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Travel Packages</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Curated packages combining stays, activities, and experiences.
            </p>
          </Link>

          <Link
            to="/itineraries"
            className="animate-fade rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-md card-hover text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Itineraries</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Plan day-by-day activities and keep your trips organized.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
