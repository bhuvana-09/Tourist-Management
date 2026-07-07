const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const User = require("../src/models/User");
const Booking = require("../src/models/Booking");
const Package = require("../src/models/Package");
const Destination = require("../src/models/Destination");
const { signAccessToken } = require("../src/utils/token");

let mongoServer;
let verifiedUserToken;
let secondUserToken;
let adminToken;
let verifiedUser;
let secondUser;
let testPackage;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);

  // Seed users
  verifiedUser = await User.create({
    name: "John Owner",
    email: "owner@example.com",
    passwordHash: "dummyhash",
    isVerified: true
  });
  verifiedUserToken = signAccessToken({ id: verifiedUser._id });

  secondUser = await User.create({
    name: "Jane Thief",
    email: "thief@example.com",
    passwordHash: "dummyhash",
    isVerified: true
  });
  secondUserToken = signAccessToken({ id: secondUser._id });

  const adminUser = await User.create({
    name: "Admin Boss",
    email: "admin@example.com",
    passwordHash: "dummyhash",
    isVerified: true,
    role: "admin"
  });
  adminToken = signAccessToken({ id: adminUser._id });

  // Seed package & destination
  const testDest = await Destination.create({
    name: "Goa Beach",
    location: "Goa, India",
    description: "Sunny beaches",
    images: [{ url: "http://example.com/goa.jpg", publicId: "goa" }]
  });

  testPackage = await Package.create({
    packageName: "Goa Weekend Getaway",
    destinationId: testDest._id,
    price: 5000,
    duration: "3 Days / 2 Nights",
    description: "Fun stay in beach resorts",
    accommodation: "3 Star resort",
    transport: "Flights included",
    meals: "Breakfast only",
    activities: ["Scuba", "Parasailing"]
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
});

describe("Booking Controller Tests", () => {
  // API requests pass packageId, phone, travelers, date
  const getBookingRequestPayload = () => ({
    packageId: testPackage._id,
    phone: "1234567890",
    travelers: 2,
    date: "2026-08-15"
  });

  // DB documents require packageId, name, email, phone, travelers, date
  const getBookingDBPayload = () => ({
    packageId: testPackage._id,
    name: "John Owner",
    email: "owner@example.com",
    phone: "1234567890",
    travelers: 2,
    date: "2026-08-15"
  });

  it("should reject booking creation if unauthenticated", async () => {
    await request(app)
      .post("/api/bookings")
      .send(getBookingRequestPayload())
      .expect(401);
  });

  it("should successfully create a booking when authenticated", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${verifiedUserToken}`)
      .send(getBookingRequestPayload())
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.userId.toString()).toBe(verifiedUser._id.toString());
    expect(res.body.data.status).toBe("pending");
    expect(res.body.data.totalPrice).toBe(10000); // 5000 * 2 travelers
  });

  it("should allow booking cancellation if status is pending or confirmed", async () => {
    // 1. Create a pending booking directly in DB
    const booking = await Booking.create({
      ...getBookingDBPayload(),
      userId: verifiedUser._id,
      totalPrice: 10000,
      status: "pending"
    });

    // 2. Cancel pending booking
    const cancelRes = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${verifiedUserToken}`)
      .expect(200);

    expect(cancelRes.body.success).toBe(true);
    expect(cancelRes.body.data.status).toBe("cancelled");
  });

  it("should reject booking cancellation if status is already completed or cancelled", async () => {
    // Create a completed booking directly in DB
    const completedBooking = await Booking.create({
      ...getBookingDBPayload(),
      userId: verifiedUser._id,
      totalPrice: 10000,
      status: "completed"
    });

    const rejectRes = await request(app)
      .patch(`/api/bookings/${completedBooking._id}/cancel`)
      .set("Authorization", `Bearer ${verifiedUserToken}`)
      .expect(400);

    expect(rejectRes.body.message).toContain("Cannot cancel booking with status: completed");
  });

  it("should reject cancellation of another user's booking", async () => {
    // Create a booking owned by John Owner directly in DB
    const booking = await Booking.create({
      ...getBookingDBPayload(),
      userId: verifiedUser._id,
      totalPrice: 10000,
      status: "pending"
    });

    // Jane Thief tries to cancel it
    const stealRes = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${secondUserToken}`)
      .expect(403);

    expect(stealRes.body.message).toContain("You do not have permission");
  });
});
