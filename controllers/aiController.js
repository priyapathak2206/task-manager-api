const Groq = require("groq-sdk");

// Per-user rate limiting store: userId -> timestamp (ms)
const aiRateLimitMap = new Map();

/**
 * Resets the rate limit map (used for unit test isolation)
 */
const resetRateLimitMap = () => {
  aiRateLimitMap.clear();
};

/**
 * @desc    Generate task description using Groq API with Responsible AI controls
 * @route   POST /api/ai/generate-description
 * @access  Private (JWT protected)
 */
const generateDescription = async (req, res, next) => {
  try {
    const { title } = req.body;

    // 1. Validate Input
    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        error: "Validation failed",
        message: "Task title is required",
      });
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 300) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Task title is too long (maximum 300 characters)",
      });
    }

    const userId = req.user.id || req.user._id;

    // 2. Per-User Rate Limiting (1 request per 60 seconds per user)
const userKey = String(userId);
const lastRequestTime = aiRateLimitMap.get(userKey);
const now = Date.now();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

if (lastRequestTime !== undefined && now - lastRequestTime < RATE_LIMIT_WINDOW_MS) {
  const secondsRemaining = Math.ceil(
    (RATE_LIMIT_WINDOW_MS - (now - lastRequestTime)) / 1000
  );

  return res.status(429).json({
    error: "Too Many Requests",
    message: `Rate limit exceeded. Please wait ${secondsRemaining} second(s) before generating another description.`,
  });
}

// Record the request timestamp so rapid repeat requests are blocked.
aiRateLimitMap.set(userKey, now);
    // 3. Environment API Key Check
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return res.status(503).json({
        error: "AI Service Unavailable",
        message: "Groq API key is not configured on the server.",
      });
    }

    // Instantiate Groq SDK (after simulation check to avoid unnecessary calls)
    const groq = new Groq({ apiKey });


    const timeoutMs = 10000; // 10-second timeout
    let timerId;
    const timeoutPromise = new Promise((_, reject) => {
      timerId = setTimeout(
        () => reject(new Error("Groq API request timed out")),
        timeoutMs
      );
    });

    const apiPromise = groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful task management assistant. Generate a concise, clear, and actionable 1-2 sentence description for the given task title. Responsible AI Guidelines: Ensure professional, safe, non-toxic, and neutral language. Do not output markdown headers or code fences.",
        },
        {
          role: "user",
          content: `Task Title: "${trimmedTitle}"`,
        },
      ],
      model: "qwen/qwen3.8-27b",
      max_completion_tokens: 150,
    });

    let response;
    try {
      response = await Promise.race([apiPromise, timeoutPromise]);
    } finally {
      if (timerId) clearTimeout(timerId);
    }

    // Log response structure safely (NEVER log API keys or raw credentials)
    console.log(
      "[Groq API Response Debug]",
      JSON.stringify({
        id: response?.id,
        model: response?.model,
        choicesLength: response?.choices?.length,
        finishReason: response?.choices?.[0]?.finish_reason,
        hasContent: Boolean(response?.choices?.[0]?.message?.content),
      })
    );

    const messageObj = response?.choices?.[0]?.message;
    let generatedText = messageObj?.content;

    if (typeof generatedText === "string") {
      // Strip internal <think>...</think> reasoning blocks some models emit
      generatedText = generatedText
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .trim();
    }

    if (!generatedText || generatedText === "") {
      console.warn(
        "[Groq API Warning] Response contained no usable description text:",
        JSON.stringify(response?.choices?.[0] || {})
      );
      return res.status(500).json({
        error: "AI Generation Failed",
        message:
          "AI model returned an empty response or reasoning-only output. Please write a description manually.",
      });
    }

    return res.status(200).json({
      description: generatedText,
      disclaimer: "AI-generated suggestion — review and edit before saving.",
    });
  } catch (err) {
    console.error("AI Generation Controller Error:", err.message || err);

    const status =
      err.message && err.message.includes("timed out") ? 504 : 500;

    return res.status(status).json({
      error: "AI Generation Failed",
      message:
        err.message && err.message.includes("timed out")
          ? "AI generation request timed out. Please try again or write your own description."
          : "Failed to generate task description. Please write a description manually.",
    });
  }
};

module.exports = {
  generateDescription,
  resetRateLimitMap,
};
