# Project Context: Tourist Management Portal (v2)

This document provides an overview of the architecture, data models, API endpoints, and migration status of the Tourist Management Portal.

## Current Architecture
- **Frontend**: React 19 + Vite 7 + Tailwind CSS + React Router v7 SPA (listening on `http://localhost:5173`)
- **Backend (Mock)**: JSON-Server (`http://localhost:3000`) serving `Packages`, `Itineraries`, and `Bookings`.
- **Backend (Real)**: Node.js + Express + MongoDB Atlas (`http://localhost:5000/api`) serving `Destinations` and `Auth`.

## Resource Migration Status
- **Auth**: **Completed** (JWT-based backend and frontend auth fully integrated in Sprint 4; Password Reset & Roles implemented in Sprint 5)
- **Destinations**: **Completed** (Migrated to Node.js/Express + MongoDB Atlas in Sprint 1; Protected write routes to admin role in Sprint 5)
- **Packages**: **Seeded** (Database models and seed script complete in Sprint 2; APIs and frontend migration pending)
- **Itineraries**: **Seeded** (Database models and seed script complete in Sprint 2; APIs and frontend migration pending)
- **Bookings**: **Seeded** (Database models and seed script complete in Sprint 2; APIs and frontend migration pending)

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
- `GET /api/destinations` - Fetch list of all destinations (Public)
- `GET /api/destinations/:id` - Fetch single destination by ID (Public)
- `POST /api/destinations` - Create a new destination (Admin Only)
- `PUT/PATCH /api/destinations/:id` - Update existing destination details (Admin Only)
- `DELETE /api/destinations/:id` - Delete destination from system (Admin Only)

### JSON-Server Backend (`http://localhost:3000`)
- `GET/POST/PUT/PATCH/DELETE /packages`
- `GET/POST/PUT/PATCH/DELETE /itineraries`
- `GET/POST/PUT/PATCH/DELETE /bookings`

## Known Issues / Manual Configuration
- **Manual Admin Role Setup**: Plain registration defaults new accounts to the `user` role. Creating/testing admin permissions requires manually changing an account's role attribute directly to `"admin"` inside the MongoDB Atlas console.

## Next Sprint Goal
- **Sprint 6: Destinations Module v2 — Cloudinary + search/filter/sort/paginate**
  - Integrate Cloudinary storage on the backend for handling destination image file uploads.
  - Implement advanced query features (filters, search, pagination, and sorting) on destination retrieval endpoints.
