const request = require("supertest");
const app = require("../app");

describe("Authentication & Authorization Middleware API Tests", () => {
  beforeAll(() => {
    // Ensure JWT_SECRET is set for tests
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_key";
  });

  test("GET /tasks without Authorization token should return HTTP 401", async () => {
    const response = await request(app).get("/tasks");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toMatch(/Access denied/i);
  });

  test("GET /tasks with invalid Authorization token should return HTTP 401", async () => {
    const response = await request(app)
      .get("/tasks")
      .set("Authorization", "Bearer invalid_token_xyz");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid or expired token.");
  });

  test("GET /auth/me without Authorization token should return HTTP 401", async () => {
    const response = await request(app).get("/auth/me");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toMatch(/Access denied/i);
  });

  test("POST /auth/register with missing fields should return HTTP 400", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Validation failed",
      message: "Email and password are required",
    });
  });
});
