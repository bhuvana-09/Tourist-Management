# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Sprint 18] - 2026-07-07
### Added
- Created `Blog.js` database schema model.
- Created `blog.controller.js` and `blog.routes.js` implementing paginated listings and admin-authored CRUD with Cloudinary integration.
- Created `contact.controller.js` and `contact.routes.js` enabling public stateless support forms forwarding to `CONTACT_EMAIL` using the Nodemailer pipeline.
- Created HTML template [contactFormEmail.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/templates/contactFormEmail.js) for contact emails.
- Created frontend accordion component [FAQAccordion.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/FAQAccordion.jsx).
- Created frontend views [Blogs.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/Blogs.jsx), [BlogDetail.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/BlogDetail.jsx), [AddBlog.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/AddBlog.jsx), [EditBlog.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/EditBlog.jsx), [Contact.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/Contact.jsx), and [FAQ.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/FAQ.jsx).

### Changed
- Mounted `/api/blogs` and `/api/contact` inside `app.js`.
- Integrated Blogs, FAQ, and Contact protected / public routes inside [App.jsx](file:///C:/Users/ridhi/.gemini/antigravity/src/App.jsx).
- Embedded Chronicles, FAQ, and Contact navigation anchors inside [Navbar.jsx](file:///C:/Users/ridhi/.gemini/antigravity/src/components/Navbar.jsx) (desktop & mobile).
- Configured blog and contact route interceptions inside [axiosInstance.js](file:///C:/Users/ridhi/.gemini/antigravity/src/api/axiosInstance.js).

---

## [Sprint 17] - 2026-07-07
### Added
- Installed backend report export dependencies: `json2csv`, `exceljs`, and `pdfkit`.
- Created [forecastService.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/services/forecastService.js) implementing least-squares linear regression forecasting.
- Created [export.controller.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/controllers/export.controller.js) and [export.routes.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/routes/export.routes.js) supporting report downloads in CSV, XLSX, and PDF formats.
- Created frontend widget [ExportButtonGroup.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/ExportButtonGroup.jsx) executing authenticated Blob file streams.

### Changed
- Refactored `analytics.controller.js` to support `/forecast` requests utilizing `forecastService`.
- Mounted `/api/export` routes inside `app.js`.
- Integrated least-squares forecasting panels and export action groups inside [AdminAnalytics.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/AdminAnalytics.jsx).
- Configured export route interceptions inside [axiosInstance.js](file:///C:/Users/ridhi/.gemini/antigravity/src/api/axiosInstance.js).

---

## [Sprint 16] - 2026-07-07
### Added
- Installed `recharts` frontend visualization dependency.
- Created `analytics.controller.js` and `analytics.routes.js` to manage admin dashboard statistics.
- Created frontend components [AnalyticsCard.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/AnalyticsCard.jsx) and [ChartWrapper.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/ChartWrapper.jsx).
- Created [AdminAnalytics.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/AdminAnalytics.jsx) dashboard page.

### Changed
- Added query execution performance indexes on `Booking.js` model for status, date, paymentStatus, and createdAt.
- Mounted `/api/analytics` routes inside `app.js`.
- Integrated [AdminAnalytics.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/AdminAnalytics.jsx) protected admin route in [App.jsx](file:///C:/Users/ridhi/.gemini/antigravity/src/App.jsx).
- Integrated Admin "Analytics" link inside [Navbar.jsx](file:///C:/Users/ridhi/.gemini/antigravity/src/components/Navbar.jsx) (desktop & mobile).
- Configured analytics route interception inside [axiosInstance.js](file:///C:/Users/ridhi/.gemini/antigravity/src/api/axiosInstance.js).

---

## [Sprint 15] - 2026-07-07
### Added
- Created `Notification.js` database schema model.
- Created `user.controller.js` and `user.routes.js` to manage user wishlist toggles and population.
- Created `notification.controller.js` and `notification.routes.js` to manage notification lists and read states.
- Created Nodemailer HTML email templates for booking confirmations and booking cancellations.
- Created frontend floating components [WishlistButton.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/WishlistButton.jsx) and [NotificationBell.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/NotificationBell.jsx).
- Created [Wishlist.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/Wishlist.jsx) page displaying populated saved destinations.

### Changed
- Added `wishlist` array reference to `User.js` model.
- Mounted `/api/users` and `/api/notifications` inside `app.js`.
- Modified `payment.controller.js` to dispatch confirmation emails and notifications asynchronously upon successful signature verification, guarded against duplicate firing.
- Modified `booking.controller.js` to dispatch cancellation emails and notifications asynchronously upon successful cancel actions.
- Integrated [NotificationBell.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/NotificationBell.jsx) and wishlist links inside [Navbar.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/Navbar.jsx) (desktop & mobile).
- Mounted `/wishlist` protected route in [App.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/App.jsx).
- Added [WishlistButton.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/WishlistButton.jsx) overlays on destination grids in [Destinations.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/Destinations.jsx) and header details in [DestinationDetail.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/DestinationDetail.jsx).
- Configured user and notification route interceptions inside [axiosInstance.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/api/axiosInstance.js).

---

## [Sprint 14] - 2026-07-07
### Added
- Added `sentimentLabel` and `sentimentScore` schema fields to [Review.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/models/Review.js) database model.
- Added `aiSummary` schema field to [Destination.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/models/Destination.js) database model.
- Created `buildSentimentPrompt` and `buildReviewSummaryPrompt` helper functions inside [aiPrompts.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/services/aiPrompts.js).
- Integrated sentiment color badges inside [ReviewCard.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/ReviewCard.jsx) dynamically displaying sentiment tags.
- Integrated AI Traveler Reviews summary consensus card inside [DestinationDetail.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/DestinationDetail.jsx).

### Changed
- Modified [review.controller.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/controllers/review.controller.js) review creator to return the saved review document to client immediately, launching background non-blocking workers to execute sentiment analysis classification and destination-level reviews summary compiling.

---

## [Sprint 13] - 2026-07-06
### Added
- Installed `express-rate-limit` backend dependency.
- Created travel Q&A chatbot system prompt and controllers.
- Created budget breakdown, packing checklist, travel tips, and admin review-grounded FAQ builders inside `aiPrompts.js`.
- Implemented rate limiter specifically guarding the open-ended `/chat` endpoint (15 requests/15 mins limit).
- Created site-wide floating chat bubble [AIChatWidget.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/AIChatWidget.jsx).

### Changed
- Added `faq` nested schemas to [Destination.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/models/Destination.js).
- Upgraded itinerary preview panel into a multi-capability tabbed AI Widget ([AIItineraryGenerator.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/AIItineraryGenerator.jsx)).
- Mounted [AIChatWidget.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/AIChatWidget.jsx) in top-level [App.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/App.jsx).
- Embedded FAQ listings and AI-regeneration triggers inside [DestinationDetail.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/DestinationDetail.jsx).

---

## [Sprint 12] - 2026-07-06
### Added
- Installed `@google/generative-ai` backend SDK dependency.
- Created reusable Gemini client wrapper [aiService.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/services/aiService.js) implementing request timeout promises, single retries, and graceful fallback exceptions.
- Created [aiPrompts.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/services/aiPrompts.js) containing templates instructing raw JSON formatting.
- Created [ai.controller.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/controllers/ai.controller.js) and [ai.routes.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/routes/ai.routes.js) containing personalized recommendations and day itinerary schedule generators.
- Created frontend personalized banner [AIRecommendationStrip.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/AIRecommendationStrip.jsx) and interactive preview [AIItineraryGenerator.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/AIItineraryGenerator.jsx).
- Added `GEMINI_API_KEY` to backend `.env.example`.

### Changed
- Added schema indicator `generatedByAI` to [Itinerary.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/models/Itinerary.js).
- Extended [axiosInstance.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/api/axiosInstance.js) request/response interceptors to route `/ai` requests.
- Integrated AI recommendations strip on Home page [Home.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/Home.jsx) for logged-in travelers.
- Integrated AI itinerary planner sidebar on [DestinationDetail.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/DestinationDetail.jsx).

---

## [Sprint 11] - 2026-07-06
### Added
- Created backend Review model [Review.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/models/Review.js) referencing User, Destination, and Booking.
- Created backend Review controllers [review.controller.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/controllers/review.controller.js) and routes [review.routes.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/routes/review.routes.js) containing post, list, and delete actions.
- Created reusable components [RatingStars.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/RatingStars.jsx), [ReviewCard.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/ReviewCard.jsx), and [ReviewForm.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/ReviewForm.jsx).
- Created public destination detail page [DestinationDetail.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/DestinationDetail.jsx).

### Changed
- Modified [Destination.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/models/Destination.js) schema to contain computed `avgRating` and `reviewCount` fields.
- Updated [booking.controller.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/controllers/booking.controller.js) and [booking.routes.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/routes/booking.routes.js) to support `PATCH /api/bookings/:id/complete` manual overrides for admins.
- Mounted reviews router inside [app.js](file:///C:/Users/ridhi/.gemini/antigravity/backend/src/app.js) and added reviews loader mapping inside [destination.routes.js](file:///C:/Users/ridhi/.gemini/antigravity/backend/src/routes/destination.routes.js).
- Modified [Destinations.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/Destinations.jsx) to render rating stars and link grid card elements to the detail page.
- Modified [MyBookings.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/MyBookings.jsx) to show a "Leave a Review" CTA for eligible completed or past reservations.
- Registered `/destinations/:id` route inside [App.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/App.jsx).

---

## [Sprint 10] - 2026-07-06
### Added
- Installed `razorpay` backend SDK dependency.
- Created [razorpay.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/config/razorpay.js) backend initialization helper.
- Created [payment.controller.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/controllers/payment.controller.js) and [payment.routes.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/routes/payment.routes.js) containing order generation (`POST /api/payments/create-order`) and signature verification (`POST /api/payments/verify`) using HMAC-SHA256.
- Created [payment.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/utils/payment.js) utility on the frontend to manage the Razorpay checkout overlay.
- Added `VITE_RAZORPAY_KEY_ID` to root `.env` config.
- Loaded Razorpay CDN library in [index.html](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/index.html).

### Changed
- Modified [Booking.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/models/Booking.js) model to contain `paymentStatus` and `paymentRef`.
- Updated [booking.controller.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/controllers/booking.controller.js) to flag paid reservations as `refunded` when cancelled.
- Gated axios interceptor configs in [axiosInstance.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/api/axiosInstance.js) to switch url targets for `/payments`.
- Modified [AddBooking.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/AddBooking.jsx) to automatically pop open Razorpay checkout modal immediately after checkout submits.
- Modified [MyBookings.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/MyBookings.jsx) to display payment badges and render a retry "Pay Now" option for unpaid pending transactions.

---

## [Sprint 9] - 2026-07-06
### Added
- Created backend Coupon model [Coupon.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/models/Coupon.js) storing code, discountPercent, expiryDate, and usage counts.
- Created backend Coupon controller [coupon.controller.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/controllers/coupon.controller.js) and routing [coupon.routes.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/routes/coupon.routes.js) with validation-preview helper.
- Created Admin Coupons management interface [AdminCoupons.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/AdminCoupons.jsx) allowing admins to audit coupon listings and add codes.

### Changed
- Modified booking model [Booking.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/models/Booking.js) to store status (pending/confirmed/cancelled/completed), totalPrice, and coupon references.
- Updated booking controller [booking.controller.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/controllers/booking.controller.js) to compute pricing server-side, validate coupons before checkout, and support booking cancellations.
- Updated booking routing [booking.routes.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/routes/booking.routes.js) to register `PATCH /api/bookings/:id/cancel`.
- Extended Axios interceptors in [axiosInstance.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/api/axiosInstance.js) to switch url instances for `/coupons`.
- Modified [AddBooking.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/AddBooking.jsx) to support optional coupon input, showing pricing previews, and sending codes at creation.
- Modified [MyBookings.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/MyBookings.jsx) and [Bookings.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/Bookings.jsx) to render status indicators and control cancellations. Added status filters for admins.
- Added `/admin/coupons` route in [App.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/App.jsx) and mounted coupons tab in [Navbar.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/Navbar.jsx) for admins.

---

## [Sprint 8] - 2026-07-06
### Added
- Installed frontend form and schema validation dependencies `react-hook-form`, `zod`, and `@hookform/resolvers`.
- Created backend booking controller [booking.controller.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/controllers/booking.controller.js) and routing [booking.routes.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/routes/booking.routes.js) to support authenticated creation, personal history listing, and owner/admin authorization checks.
- Created user booking history interface [MyBookings.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/MyBookings.jsx) fetching from `/api/bookings/me`.

### Changed
- Added optional `userId` ObjectId reference to the Booking model [Booking.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/models/Booking.js) for schema compatibility.
- Mounted `/api/bookings` route inside backend [app.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/app.js).
- Extended Axios interceptors in [axiosInstance.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/api/axiosInstance.js) to dynamically switch instances and parse metadata for Bookings.
- Rewrote booking form page [AddBooking.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/AddBooking.jsx) to utilize `react-hook-form` and `zod` resolver validations, auto-filling name/email from session context and checking travel date ranges.
- Repurposed bookings overview page [Bookings.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/Bookings.jsx) as an admin-only portal that displays legacy guest checkouts and registered accounts.
- Updated [App.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/App.jsx) routes to protect `/bookings` as admin-only, add `/my-bookings` for authenticated users, and require authentication for `/bookings/add`.
- Modified [Navbar.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/components/Navbar.jsx) to only show "Bookings" links to logged-in admins, and append a "My Bookings" history link for all authenticated accounts.

---

## [Sprint 7] - 2026-07-06
### Added
- Created backend package controller [package.controller.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/controllers/package.controller.js) and routes [package.routes.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/routes/package.routes.js) supporting admin validation and document relations.
- Created backend itinerary controller [itinerary.controller.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/controllers/itinerary.controller.js) and routes [itinerary.routes.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/routes/itinerary.routes.js) mapping itineraries to active destinations.

### Changed
- Added optional `destinationId` ObjectId link to the Package schema model [Package.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/models/Package.js) referencing the Destinations collection.
- Mounted `/api/packages` and `/api/itineraries` endpoints inside the primary Express server entrypoint [app.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/app.js).
- Extended Axios interceptors in [axiosInstance.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/api/axiosInstance.js) to dynamically switch target instances and parse metadata for Packages and Itineraries.
- Refactored frontend pages [Packages.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/Packages.jsx) and [Itineraries.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/Itineraries.jsx) to pull data from real endpoints, populate mapped destination properties, and restrict CRUD controls to authorized admin logins.
- Updated package forms [AddPackage.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/AddPackage.jsx) and [EditPackage.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/EditPackage.jsx) to retrieve the active destination index and selection-map destinations using dropdowns.
- Replaced the free-text destination entry inputs inside [AddItinerary.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/AddItinerary.jsx) and [EditItinerary.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/EditItinerary.jsx) with required destination dropdown menus matching database indices.

---

## [Sprint 6] - 2026-07-06
### Added
- Configured Cloudinary settings inside [cloudinary.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/config/cloudinary.js).
- Configured Multer memory-storage and file filter middlewares inside [upload.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/middlewares/upload.js) with 5MB limits and MIME type gating.
- Created idempotent data migration script [migrateDestinationImages.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/scripts/migrateDestinationImages.js) to convert legacy database objects to support the new array images structure.
- Implemented query pagination, case-insensitive partial searches, locations filtering, and tag intersections in the GET `/api/destinations` controller handler.

### Changed
- Migrated legacy `image` schema field to `images` array of objects (retaining url and publicId details) and added optional `tags` array inside the Destination model [Destination.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/models/Destination.js).
- Updated [AddDestination.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/AddDestination.jsx) and [EditDestination.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/EditDestination.jsx) to support file upload inputs and parse multipart `FormData` submissions.
- Refactored [Destinations.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/Destinations.jsx) to render dynamic images directly from API parameters and add search inputs, location inputs, sort selectors, and pagination controls.
- Adjusted Axios response interceptors in [axiosInstance.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/api/axiosInstance.js) to preserve response metadata alongside data arrays.

### Removed
- Retired legacy hardcoded per-city city-to-image lookups map in the frontend.

---

## [Sprint 5] - 2026-07-06
### Added
- Created `ForgotPassword` interface [ForgotPassword.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/ForgotPassword.jsx) to request a password reset email.
- Created `ResetPassword` interface [ResetPassword.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/ResetPassword.jsx) supporting password change requests utilizing verification tokens.
- Created reset password HTML email template in [resetPasswordEmail.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/templates/resetPasswordEmail.js).
- Added `forgotPassword` and `resetPassword` controller handlers inside [auth.controller.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/controllers/auth.controller.js) with generic success responses (preventing user enumeration) and hashing validation.
- Registered `/forgot-password` and `/reset-password` endpoints under `/api/auth` in backend routes.
- Registered `/forgot-password` and `/reset-password` routes on the frontend in `App.jsx`.

### Changed
- Extended backend `User` schema in [User.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/models/User.js) to store hashed reset tokens and expiration timestamps.
- Secured backend Destination write routes (`POST`, `PUT`, `PATCH`, `DELETE`) in [destination.routes.js](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/backend/src/routes/destination.routes.js) with `authenticate` and `authorize('admin')` middlewares, while leaving GET requests public.
- Wrapped frontend `/destinations/add` and `/destinations/edit/:id` routes in [App.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/App.jsx) with role verification (`roles={['admin']}`).
- Conditionalized Add, Edit, and Delete action button displays inside [Destinations.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/Destinations.jsx) based on admin credentials.
- Added link to forgot password screen in [Login.jsx](file:///C:/Users/ridhi/.gemini/antigravity/scratch/Tourist-Management/src/pages/Login.jsx).

---

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
