process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_key";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const { resetStats } = require("../cache");

describe("Integrated API Tests: Health, Cache & Activity Events", () => {
  let validToken;

  beforeAll(() => {
    validToken = jwt.sign({ id: "user_test_integrated" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  });

  beforeEach(() => {
    resetStats();
  });

  test("GET /health returns 200 with system health and practicals mapping", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "healthy");
    expect(res.body).toHaveProperty("application", "TaskFlow — AWDF Integrated Application");
    expect(res.body).toHaveProperty("uptimeSeconds");
    expect(res.body).toHaveProperty("database");
    expect(res.body).toHaveProperty("memory");
    expect(res.body).toHaveProperty("cache");
    expect(res.body).toHaveProperty("practicals");
    expect(res.body.practicals).toHaveProperty("P1");
    expect(res.body.practicals).toHaveProperty("P13");
  });

  test("GET /api/events without auth token returns 401", async () => {
    const res = await request(app).get("/api/events");

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Access denied/i);
  });

  test("GET /api/events with valid auth token returns 200 and events array", async () => {
    const res = await request(app)
      .get("/api/events")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(Array.isArray(res.body.events)).toBe(true);
  });

  test("GET /tasks/cache-stats with valid token returns cache metrics", async () => {
    const res = await request(app)
      .get("/tasks/cache-stats")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("hits");
    expect(res.body).toHaveProperty("misses");
    expect(res.body).toHaveProperty("stdTTL", 60);
  });

  test("POST /tasks/cache-clear with valid token invalidates user cache", async () => {
    const res = await request(app)
      .post("/tasks/cache-clear")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Cache invalidated successfully");
    expect(res.body).toHaveProperty("stats");
  });
});

