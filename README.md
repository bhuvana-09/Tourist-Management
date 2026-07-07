# Tourist Management Portal v2

An enterprise-grade, full-stack tourist management platform featuring real-time package booking, payment gateway integration, AI-driven sentiment analysis, admin analytics with forecasting, interactive content blogs, and offline PWA capabilities.

## Live Deployments

- **Frontend**: [Vercel Production App](https://tourist-management-alpha.vercel.app)
- **Backend API**: [Render Service](https://tourist-management-backend-q0pe.onrender.com)
- **Database**: MongoDB Atlas Shared Cluster

---

## Key Features

1. **User Authentication**: Role-based access control (Admin vs. Tourist) with JSON Web Token (JWT) session persistence.
2. **Booking & Payments**: Full package checkout integration backed by Razorpay Sandbox.
3. **AI-Powered Reviews**: Automated feedback sentiment classification and dynamic summary generation powered by Gemini APIs.
4. **Admin Analytics & Forecasting**: Backend MongoDB aggregate pipelines generating charts, future volume/revenue forecasting, and multi-format exports (CSV, Excel, PDF).
5. **Interactive Content**: Blog engine, contact form submissions with auto-replies, and general FAQ page.
6. **Dark Mode Support**: Class-based theme toggling persisted via localStorage.
7. **PWA & Accessibility**: Service worker caching for offline access, skip-to-content accessibility bypass, and semantic HTML structure.
8. **Performance Optimizations**: Code splitting, skeleton load states, and image lazy-loading.

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router, TailwindCSS, Recharts, Lucide Icons
- **Backend**: Node.js, Express, Mongoose, Zod
- **Database**: MongoDB Atlas
- **Testing**: Vitest, React Testing Library, Jest, Supertest

---

## Setup & Running Locally

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file (see `.env.example`):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/tourist-portal
   JWT_SECRET=your_jwt_secret
   CONTACT_EMAIL=admin@touristportal.com
   ```
4. Start the backend server:
   - Development mode: `npm run dev`
   - Production mode: `npm start`

### Frontend Setup

1. From the project root, install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

---

## Running the Test Suites

### Backend Tests (Jest)
Tests are located in `backend/tests/` and use an in-memory database mock.
```bash
cd backend
npm test
```

### Frontend Tests (Vitest & JSDOM)
Tests are located in `src/__tests__/`.
```bash
npm run test
```

---

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration. The workflow configuration is located in `.github/workflows/ci.yml`. On every pull request to `main` or `develop`, it automatically executes:
1. Backend dependencies installation & test execution.
2. Frontend dependencies installation & linting.
3. Frontend unit tests.
4. Frontend production build validation.
