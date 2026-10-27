process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_key";
process.env.GROQ_API_KEY = "test_mock_groq_key";

const request = require("supertest");
const jwt = require("jsonwebtoken");	

const mockGroqCreate = jest.fn();

jest.mock("groq-sdk", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockGroqCreate,
      },
    },
  }));
});

const app = require("../app");
const { resetRateLimitMap } = require("../controllers/aiController");

describe("AI Task Description Generator API (POST /api/ai/generate-description)", () => {
  let validToken;

  beforeAll(() => {
    validToken = jwt.sign({ id: "user_test_ai_1" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  });

  beforeEach(() => {
    resetRateLimitMap();
    mockGroqCreate.mockReset();
    process.env.GROQ_API_KEY = "test_mock_groq_key";
  });

  test("1. Reject request without Authorization token (HTTP 401)", async () => {
    const res = await request(app)
      .post("/api/ai/generate-description")
      .send({ title: "Build feature" });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toMatch(/Access denied/i);
  });

  test("2. Reject invalid input with missing title (HTTP 400)", async () => {
    const res = await request(app)
      .post("/api/ai/generate-description")
      .set("Authorization", `Bearer ${validToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.message).toMatch(/title is required/i);
  });

  test("3. Return 503 when GROQ_API_KEY is missing", async () => {
    delete process.env.GROQ_API_KEY;

    const res = await request(app)
      .post("/api/ai/generate-description")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ title: "Write documentation" });

    expect(res.status).toBe(503);
    expect(res.body.error).toBe("AI Service Unavailable");
    expect(res.body.message).toMatch(/key is not configured/i);
  });

  test("4. Return 200 with generated description and disclaimer on successful AI response", async () => {
    mockGroqCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content:
              "Comprehensive guide detailing API endpoints, security, and setup instructions.",
          },
        },
      ],
    });

    const res = await request(app)
      .post("/api/ai/generate-description")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ title: "Write documentation" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty(
      "description",
      "Comprehensive guide detailing API endpoints, security, and setup instructions."
    );
    expect(res.body).toHaveProperty(
      "disclaimer",
      "AI-generated suggestion — review and edit before saving."
    );
  });

  test("5. Handle Groq API errors gracefully (HTTP 500)", async () => {
    mockGroqCreate.mockRejectedValueOnce(
      new Error("Groq API connection error")
    );

    const res = await request(app)
      .post("/api/ai/generate-description")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ title: "Deploy application" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("AI Generation Failed");
    expect(res.body.message).toContain("Failed to generate task description");
  });

  test("6. Handle empty or reasoning-only response gracefully (HTTP 500)", async () => {
    mockGroqCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: "<think>Processing input...</think>",
          },
        },
      ],
    });

    const res = await request(app)
      .post("/api/ai/generate-description")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ title: "Audit security logs" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("AI Generation Failed");
    expect(res.body.message).toMatch(/empty response or reasoning-only output/i);
  });

  test("7. Enforce per-user rate limit (HTTP 429 on rapid second request)", async () => {
    mockGroqCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: "First task description",
          },
        },
      ],
    });

    // First request - should succeed
    const res1 = await request(app)
      .post("/api/ai/generate-description")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ title: "First Task" });

    expect(res1.status).toBe(200);

    // Second request within 60s for same user - should fail with 429
    const res2 = await request(app)
      .post("/api/ai/generate-description")

      .set("Authorization", `Bearer ${validToken}`)
      .send({ title: "Second Task" });

    expect(res2.status).toBe(429);
    expect(res2.body.error).toBe("Too Many Requests");
    expect(res2.body.message).toMatch(/Rate limit exceeded/i);
  });
});
