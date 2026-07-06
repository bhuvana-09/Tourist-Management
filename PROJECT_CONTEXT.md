# Project Context: Tourist Management Portal (v2)

This document provides an overview of the architecture, data models, API endpoints, and migration status of the Tourist Management Portal.

## Current Architecture
- **Frontend**: React 19 + Vite 7 + Tailwind CSS + React Router v7 SPA (listening on `http://localhost:5173`)
- **Backend (Mock)**: JSON-Server (`http://localhost:3000`) serving `Packages`, `Itineraries`, and `Bookings`.
- **Backend (Real)**: Node.js + Express + MongoDB Atlas (`http://localhost:5000/api`) serving `Destinations` and `Auth`.

## Resource Migration Status
- **Auth**: **Completed** (JWT-based backend and frontend auth fully integrated in Sprint 4)
- **Destinations**: **Completed** (Migrated to Node.js/Express + MongoDB Atlas in Sprint 1)
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

#### Destinations Endpoints
- `GET /api/health` - Check health status of the backend API
- `GET /api/destinations` - Fetch list of all destinations
- `GET /api/destinations/:id` - Fetch single destination by ID
- `POST /api/destinations` - Create a new destination
- `PUT/PATCH /api/destinations/:id` - Update existing destination details
- `DELETE /api/destinations/:id` - Delete destination from system

### JSON-Server Backend (`http://localhost:3000`)
- `GET/POST/PUT/PATCH/DELETE /packages`
- `GET/POST/PUT/PATCH/DELETE /itineraries`
- `GET/POST/PUT/PATCH/DELETE /bookings`

## Next Sprint Goal
- **Sprint 5: Password Reset & Roles**
  - Implement request password reset and reset password flow (endpoints + frontend screens).
  - Enforce user authorization rules (roles based: admin only) on specific routes and interfaces.
