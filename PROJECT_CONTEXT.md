# Project Context: Tourist Management Portal (v2)

This document provides an overview of the architecture, data models, API endpoints, and migration status of the Tourist Management Portal.

## Current Architecture
- **Frontend**: React 19 + Vite 7 + Tailwind CSS + React Router v7 SPA (listening on `http://localhost:5173`)
- **Backend (Mock)**: JSON-Server (`http://localhost:3000`) serving `Packages`, `Itineraries`, and `Bookings`.
- **Backend (Real)**: Node.js + Express + MongoDB Atlas (`http://localhost:5000/api`) serving `Destinations` and `Auth`.

## Resource Migration Status
- **Auth**: **Completed** (JWT-based backend and frontend auth fully integrated in Sprint 4; Password Reset & Roles implemented in Sprint 5)
- **Destinations**: **Completed** (Cloudinary image upload integration, database schema update from `image: String` to `images: Array`, and server-side search/filter/sort/pagination completed in Sprint 6. Hardcoded city image mapping resolved)
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
- `GET /api/destinations` - Fetch query-paginated list of destinations (Public). Query parameters:
  - `search`: partial match on name or description
  - `location`: filter by location
  - `tags`: filter by tags list (comma-separated list, matches any)
  - `sortBy`: name, location, or createdAt
  - `order`: asc or desc
  - `page` / `limit`: page selector
- `GET /api/destinations/:id` - Fetch single destination by ID (Public)
- `POST /api/destinations` - Create a new destination with Cloudinary file upload (Admin Only)
- `PUT/PATCH /api/destinations/:id` - Update destination details and upload replacement image (Admin Only)
- `DELETE /api/destinations/:id` - Delete destination from system and destroy matching Cloudinary asset (Admin Only)

### JSON-Server Backend (`http://localhost:3000`)
- `GET/POST/PUT/PATCH/DELETE /packages`
- `GET/POST/PUT/PATCH/DELETE /itineraries`
- `GET/POST/PUT/PATCH/DELETE /bookings`

## Known Issues / Manual Configuration
- **Manual Admin Role Setup**: Plain registration defaults new accounts to the `user` role. Creating/testing admin permissions requires manually changing an account's role attribute directly to `"admin"` inside the MongoDB Atlas console.

## Next Sprint Goal
- **Sprint 7: Packages & Itineraries**
  - Implement full backend CRUD endpoints and Mongoose schemas for Packages and Itineraries, shutting down JSON-server stubs for these components.
  - Wire up frontend catalogs to these new real endpoints.
