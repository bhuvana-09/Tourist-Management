const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const User = require("../src/models/User");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Auth Controller Tests", () => {
  it("should successfully register a user but require email verification to login", async () => {
    const testUser = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123"
    };

    // 1. Register User
    const regRes = await request(app)
      .post("/api/auth/register")
      .send(testUser)
      .expect(201);

    expect(regRes.body.success).toBe(true);
    expect(regRes.body.data.message).toContain("Registration successful");

    const createdUser = await User.findOne({ email: testUser.email });
    expect(createdUser).toBeDefined();
    expect(createdUser.isEmailVerified).toBe(false);

    // 2. Rejection case: Try to login with unverified email
    const loginFailRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(403);

    expect(loginFailRes.body.message).toContain("verify your email");

    // Manually sign verification token
    const { signVerificationToken } = require("../src/utils/token");
    const verificationToken = signVerificationToken({ id: createdUser._id });

    // 3. Verify Email
    const verifyRes = await request(app)
      .get(`/api/auth/verify-email/${verificationToken}`)
      .expect(200);

    expect(verifyRes.body.data.message).toContain("verified successfully");

    const verifiedUser = await User.findOne({ email: testUser.email });
    expect(verifiedUser.isEmailVerified).toBe(true);

    // 4. Login after verification
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);

    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.user.email).toBe(testUser.email);
    expect(loginRes.body.data.accessToken).toBeDefined();
    
    // Refresh token should be in the cookie
    const cookies = loginRes.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain("refreshToken");

    // 5. Refresh token flow
    const refreshRes = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookies)
      .expect(200);

    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data.accessToken).toBeDefined();

    // 6. Logout flow
    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .expect(200);

    expect(logoutRes.body.success).toBe(true);
  });

  it("should reject login with bad credentials", async () => {
    const badCredUser = {
      name: "Bad Creds",
      email: "badlogin@example.com",
      password: "password123"
    };

    // Register & hash password manually
    const bcrypt = require("bcrypt");
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(badCredUser.password, salt);

    const doc = await User.create({
      name: badCredUser.name,
      email: badCredUser.email,
      passwordHash,
      isEmailVerified: true
    });

    expect(doc.isEmailVerified).toBe(true);

    // Try bad password
    const loginFail = await request(app)
      .post("/api/auth/login")
      .send({
        email: badCredUser.email,
        password: "wrongpassword"
      });

    console.log("LOGIN FAIL RESPONSE:", loginFail.status, loginFail.body);

    expect(loginFail.status).toBe(401);
    expect(loginFail.body.message).toContain("Invalid credentials");
  });

  it("should reject verification with invalid token", async () => {
    const failVerify = await request(app)
      .get("/api/auth/verify-email/invalidtoken123")
      .expect(400);

    expect(failVerify.body.message).toContain("Invalid or expired verification token");
  });
});
