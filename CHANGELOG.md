# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Sprint 4] - 2026-07-06
### Added
- Created `AuthContext` to manage in-memory user and token states, exposing login, register, and logout operations.
- Implemented registration interface [Register.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/Register.jsx) allowing users to sign up and triggers email dispatch.
- Implemented email verification interface [VerifyEmail.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/VerifyEmail.jsx) reading verification tokens via URL paths or query parameters.
- Mounted `/register` and `/verify-email` routes in [App.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/App.jsx).

### Changed
- Refactored Axios instances [axiosInstance.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/api/axiosInstance.js):
  - Configured `withCredentials: true` globally for backend operations.
  - Attached request interceptor adding `Authorization: Bearer <accessToken>` headers.
  - Attached response interceptor resolving 401 errors through automatic token refresh retries.
- Refactored [ProtectedRoute.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/auth/ProtectedRoute.jsx) to consume authorization parameters from `AuthContext` and support optional roles validation.
- Updated [Login.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/Login.jsx) and [Navbar.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/Navbar.jsx) to consume context properties.

### Removed
- Retired legacy `localStorage`-based fake authentication stub.

---

## [Sprint 3] - 2026-07-06
### Added
- Created `User` Mongoose data model with secure `passwordHash` and `refreshTokenHash` properties.
- Implemented backend auth routes:
  - `POST /api/auth/register` (creates user, hashes password with `bcrypt` (12 rounds), triggers verification email).
  - `GET /api/auth/verify-email/:token` (resolves token and verifies user email).
  - `POST /api/auth/login` (checks password, issues short-lived JWT access token in response body and sets a secure httpOnly `refreshToken` cookie).
  - `POST /api/auth/refresh` (issues a new access token from valid refresh cookie).
  - `POST /api/auth/logout` (invalidates database session hash and clears cookie).
  - `GET /api/auth/me` (profile endpoint protected by token authentication).
- Created token utilities `signAccessToken`, `signRefreshToken`, `verifyAccessToken`, `verifyRefreshToken`, and verification token helpers in `backend/src/utils/token.js`.
- Created email utility helper using Nodemailer with SMTP config in `backend/src/utils/email.js` and an HTML verification template in `backend/src/templates/verifyEmail.js`.
- Implemented reusable middleware `authenticate` (bearer token validation) and `authorize` (roles validation).
- Integrated manual cookie parsing inside controllers to read cookies without adding unlisted package dependencies.
- Registered auth routes under `/api/auth` in `backend/src/app.js`.

---

## [Sprint 2] - 2026-07-06
### Added
- Created Mongoose models for Packages, Itineraries, and Bookings.
- Added a unique index to the `name` field in the Destination model.
- Wrote an idempotent data migration seed script `backend/scripts/seed.js` that:
  - Validates Destinations for duplicate names before executing.
  - Upserts Destinations and Packages.
  - Migrates Itineraries and Bookings from `db.json`, converting their legacy name-string references (`destinationName`, `packageName`) into proper MongoDB `ObjectId` references (`destinationId`, `packageId`).
  - Gracefully handles mismatches by logging warnings and skipping records.
  - Outputs a clear, structured summary of operations.
- Added a `"seed"` shortcut script to `backend/package.json`.

### Fixed
- Migrated name-string database references to ObjectIds in the database.

---

## [Sprint 1] - 2026-07-06
### Added
- Created Node.js + Express backend infrastructure in `backend/` folder.
- Configured Express server middleware: `helmet` for security headers, `morgan` for requests logging, `cors` to allow frontend origin, and built-in body-parser.
- Configured MongoDB Atlas integration using Mongoose ORM.
- Centralized configuration loader using `dotenv`.
- MVC structure components for **Destinations** resource:
  - `Destination` model with virtual `id` serialization.
  - `destination.controller.js` for CRUD handlers.
  - `destination.routes.js` defining API endpoints.
- Error handling utilities: `asyncHandler` wrapper and a global `errorHandler` middleware.
- Created `PROJECT_CONTEXT.md` to document the system state.

### Changed
- Configured frontend Axios instances in `src/api/axiosInstance.js` to support dual-backend connections:
  - Default `api` continues calling JSON-Server (`http://localhost:3000`) for Packages, Itineraries, and Bookings.
  - New `backendApi` routing to Express backend (`http://localhost:5000/api`) for Destinations.
  - Response interceptor on `backendApi` to unwrap `{ success: true, data }` responses.
- Migrated frontend pages `Destinations.jsx`, `AddDestination.jsx`, and `EditDestination.jsx` to fetch/mutate data from the new Express backend.
- Updated root `.gitignore` to prevent committing `backend/.env` and `backend/node_modules`.

### Known Issues
- None.

---

## [Sprint 0] - 2026-07-05
### Added
- Initialized React 19 + Vite 7 SPA project structure.
- Styled pages with Tailwind CSS and configured layout shells.
- Created temporary client-side authentication and ProtectedRoutes.
- Designed JSON-Server mock database (`db.json`) for prototype.
