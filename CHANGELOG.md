# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
