# Project Context: Tourist Management Portal (v2)

This document provides an overview of the architecture, data models, API endpoints, and migration status of the Tourist Management Portal.

## Current Architecture
- **Frontend**: React 19 + Vite 7 + Tailwind CSS + React Router v7 SPA (listening on `http://localhost:5173`)
- **Backend (Mock)**: JSON-Server (`http://localhost:3000`) serving `Packages`, `Itineraries`, and `Bookings`.
- **Backend (Real)**: Node.js + Express + MongoDB Atlas (`http://localhost:5000/api`) serving `Destinations`.

## Resource Migration Status
- **Destinations**: **Completed** (Migrated to Node.js/Express + MongoDB Atlas in Sprint 1)
- **Packages**: **Pending** (Serviced by JSON-Server at port 3000)
- **Itineraries**: **Pending** (Serviced by JSON-Server at port 3000)
- **Bookings**: **Pending** (Serviced by JSON-Server at port 3000)

## Current APIs

### Express + MongoDB Backend (`http://localhost:5000/api`)
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
- **Sprint 2: Data Migration**
  - Migrate the Packages resource to Express + MongoDB.
  - Setup schema references between Packages and Destinations.
  - Implement a data migration script to populate MongoDB from the existing `db.json` file.
