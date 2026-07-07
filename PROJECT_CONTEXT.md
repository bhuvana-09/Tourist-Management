# Project Context: Tourist Management Portal (v2)

This document provides an overview of the architecture, data models, API endpoints, and migration status of the Tourist Management Portal.

## Current Architecture
- **Frontend**: React 19 + Vite 7 + Tailwind CSS + React Router v7 SPA (listening on `http://localhost:5173`)
- **Backend (Mock)**: Retired completely. JSON-Server is no longer required for any resource.
- **Backend (Real)**: Node.js + Express + MongoDB Atlas (`http://localhost:5000/api`) serving `Destinations`, `Auth`, `Packages`, `Itineraries`, `Bookings`, `Coupons`, `Payments`, `Reviews`, and `AI`.

## Resource Migration Status
- **Auth**: **Completed** (JWT-based backend and frontend auth fully integrated in Sprint 4; Password Reset & Roles implemented in Sprint 5)
- **Destinations**: **Completed** (Cloudinary image upload integration, database schema update from `image: String` to `images: Array`, and server-side search/filter/sort/pagination completed in Sprint 6. Hardcoded city image mapping resolved)
- **Packages**: **Completed** (CRUD API and model validation finished in Sprint 7. Added optional/nullable `destinationId` linking relation)
- **Itineraries**: **Completed** (CRUD API and dropdown destination select validations finished in Sprint 7. Retired legacy free-text location entry. Added AI indicators in Schema in Sprint 12)
- **Bookings**: **Completed** (CRUD API, RHF/Zod checkout validation, and status lifecycle cancellation flow finished in Sprint 9)
- **Coupons**: **Completed** (Database model, validator middleware, validation-preview endpoint, and admin coupons manager finished in Sprint 9)
- **Payments**: **Completed** (Razorpay test-mode integration, local HMAC-SHA256 signature verification, retry checkout path, and simulated refunds finished in Sprint 10)
- **Reviews**: **Completed** (Database model, strict completion-eligibility validations, dynamic rating re-computation, detail pages, and rating stars finished in Sprint 11)
- **AI**: **Completed** (Gemini client SDK wrapper, try-once retry handlers, personalized recommendations grounding, day itineraries planner, site-wide rate-limited travel chatbot support, packing list builder, budget breakdowns optimizer, travel tips, admin review-grounded FAQ generator, and asynchronous background sentiment classification + cached destination AI review summaries completed in Sprint 14)

## Current APIs

### Express + MongoDB Backend (`http://localhost:5000/api`)
#### Auth Endpoints
- `POST /api/auth/register` - Create a user and trigger verification email
- `GET /api/auth/verify-email/:token` - Verify user email address
- `POST /api/auth/login` - Validate credentials, return access token, set refresh token cookie
- `POST /api/auth/refresh` - Refresh access token using httpOnly cookie
- `POST /api/auth/logout` - Invalidate session and clear cookies
- `GET /api/auth/me` - Fetch current authenticated user's profile (requires bearer token)
- `POST /api/auth/forgot-password` - Request a password reset email (generic response to prevent user enumeration)
- `POST /api/auth/reset-password/:token` - Reset user password using active verification token

#### Destinations Endpoints
- `GET /api/health` - Check health status of the backend API
- `GET /api/destinations` - Fetch query-paginated list of destinations (Public). Query parameters:
  - `search`: partial match on name or description
  - `location`: filter by location
  - `tags`: filter by tags list (comma-separated list, matches any)
  - `sortBy`: name, location, or createdAt
  - `order`: asc or desc
  - `page` / `limit`: page selector
- `GET /api/destinations/:id` - Fetch single destination by ID (Public)
- `GET /api/destinations/:id/reviews` - Fetch reviews for a specific destination (Public)
- `POST /api/destinations` - Create a new destination with Cloudinary file upload (Admin Only)
- `PUT/PATCH /api/destinations/:id` - Update destination details and upload replacement image (Admin Only)
- `DELETE /api/destinations/:id` - Delete destination from system and destroy matching Cloudinary asset (Admin Only)

#### Packages Endpoints
- `GET /api/packages` - Fetch list of packages with populated `destinationId` details (Public)
- `GET /api/packages/:id` - Fetch single package (Public)
- `POST /api/packages` - Create new package (Admin Only)
- `PUT/PATCH /api/packages/:id` - Update package fields (Admin Only)
- `DELETE /api/packages/:id` - Delete package (Admin Only)

#### Itineraries Endpoints
- `GET /api/itineraries` - Fetch list of itineraries with populated `destinationId` details (Public)
- `GET /api/itineraries/:id` - Fetch single itinerary (Public)
- `POST /api/itineraries` - Create new itinerary (Admin Only)
- `PUT/PATCH /api/itineraries/:id` - Update itinerary (Admin Only)
- `DELETE /api/itineraries/:id` - Delete itinerary (Admin Only)

#### Bookings Endpoints
- `GET /api/bookings` - Fetch list of all bookings (Admin Only)
- `GET /api/bookings/me` - Fetch logged-in user's own booking history (Authenticated)
- `GET /api/bookings/:id` - Fetch single booking details (Owner or Admin Only)
- `POST /api/bookings` - Create new booking associated with logged-in user (Authenticated)
- `PATCH /api/bookings/:id/cancel` - Cancel a pending or confirmed booking (Owner or Admin Only)
- `PATCH /api/bookings/:id/complete` - Manually transition a booking to completed status (Admin Only)
- `DELETE /api/bookings/:id` - Delete booking (Admin Only)

#### Coupons Endpoints
- `GET /api/coupons/validate/:code` - Validate code and return discountPercent (Public)
- `GET /api/coupons` - List all coupons (Admin Only)
- `POST /api/coupons` - Create a new coupon code (Admin Only)

#### Payments Endpoints
- `POST /api/payments/create-order` - Generate Razorpay transaction order (Authenticated Booking Owner)
- `POST /api/payments/verify` - Strictly verify HMAC-SHA256 signature and update booking indicators (Authenticated Booking Owner)

#### Reviews Endpoints
- `POST /api/reviews` - Submit feedback for an eligible trip booking (Authenticated Booking Owner)
- `DELETE /api/reviews/:id` - Delete a review and trigger ratings re-computation (Owner or Admin Only)

#### AI Endpoints
- `POST /api/ai/recommendations` - Retrieve personalized destination recommendations grounded in booking history (Authenticated User)
- `POST /api/ai/itinerary` - Generate day-by-day sightseeing itinerary preview for a destination (Public)
- `POST /api/ai/chat` - Travel Q&A chatbot support (Public, rate-limited to 15 requests per 15 mins)
- `POST /api/ai/budget-optimizer` - Dynamic trip category cost breakdown distribution planner (Public)
- `POST /api/ai/packing-list` - Duration & season tailored travel checklists builder (Public)
- `POST /api/ai/travel-tips` - Insider travel guidelines safety tips (Public)
- `POST /api/ai/faq/:destinationId` - Admin-only review-grounded FAQ editor generator (Admin Only)

## Known Issues / Manual Configuration
- **Manual Admin Role Setup**: Plain registration defaults new accounts to the `user` role. Creating/testing admin permissions requires manually changing an account's role attribute directly to `"admin"` inside the MongoDB Atlas console.

## Next Sprint Goal
- **Sprint 15: Wishlist, Notifications, Email**
  - Build traveler wishlist manager, site-wide notifications system, and transactional updates email dispatchers.
