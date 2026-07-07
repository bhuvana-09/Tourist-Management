const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const User = require("../src/models/User");
const Booking = require("../src/models/Booking");
const { signAccessToken } = require("../src/utils/token");

let mongoServer;
let adminToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);

  // Seed an Admin user to hit the analytics endpoints
  const adminUser = await User.create({
    name: "Admin Boss",
    email: "admin@example.com",
    passwordHash: "dummyhash",
    isVerified: true,
    role: "admin"
  });
  adminToken = signAccessToken({ id: adminUser._id });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
});

describe("Analytics Aggregation Pipeline Tests", () => {
  it("should output correct hand-calculated metrics from fixture bookings", async () => {
    // Seeding precisely-configured fixture bookings with schema-conforming fields:
    // 1. Paid & Confirmed
    await Booking.create({
      userId: new mongoose.Types.ObjectId(),
      packageId: new mongoose.Types.ObjectId(),
      name: "Traveler A",
      email: "a@example.com",
      phone: "1111111111",
      date: "2026-08-01",
      travelers: 1,
      totalPrice: 10000,
      paymentStatus: "paid",
      status: "confirmed"
    });

    // 2. Paid & Completed
    await Booking.create({
      userId: new mongoose.Types.ObjectId(),
      packageId: new mongoose.Types.ObjectId(),
      name: "Traveler B",
      email: "b@example.com",
      phone: "2222222222",
      date: "2026-08-02",
      travelers: 1,
      totalPrice: 5000,
      paymentStatus: "paid",
      status: "completed"
    });

    await Booking.create({
      userId: new mongoose.Types.ObjectId(),
      packageId: new mongoose.Types.ObjectId(),
      name: "Traveler C",
      email: "c@example.com",
      phone: "3333333333",
      date: "2026-08-03",
      travelers: 1,
      totalPrice: 4000,
      paymentStatus: "unpaid",
      status: "pending"
    });

    // 4. Unpaid & Cancelled
    await Booking.create({
      userId: new mongoose.Types.ObjectId(),
      packageId: new mongoose.Types.ObjectId(),
      name: "Traveler D",
      email: "d@example.com",
      phone: "4444444444",
      date: "2026-08-04",
      travelers: 1,
      totalPrice: 6000,
      paymentStatus: "unpaid",
      status: "cancelled"
    });

    // --- Hand-Calculated Aggregation Metrics ---
    // Total Bookings = 4
    // Cancelled Bookings = 1 (Traveler D)
    // Paid Bookings = 2 (Traveler A, Traveler B)
    // Paid Revenue = 10000 + 5000 = 15000
    // Average Spend on Paid = 15000 / 2 = 7500
    // Cancellation Rate = (Cancelled [1] / Total [4]) * 100 = 25%

    const res = await request(app)
      .get("/api/analytics/overview")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    
    const { totalBookings, totalRevenue, cancellationRate, averageSpend } = res.body.data;
    
    expect(totalBookings).toBe(4);
    expect(totalRevenue).toBe(15000);
    expect(averageSpend).toBe(7500);
    expect(cancellationRate).toBe(25); // 25.0% cancellation rate
  });
});
