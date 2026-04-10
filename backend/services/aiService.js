const axios = require("axios");

const { FORMAT_RULES, getBrandPromptContext } = require("../utils/brandContext");

const USER_FACING_ERROR = "Unable to generate content. Please try again.";
const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
// Groq retired older IDs (e.g. llama3-8b-8192, mixtral-8x7b-32768). Use current production IDs from console.groq.com/docs/models
const GROQ_MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "openai/gpt-oss-20b",
];
const GROQ_TIMEOUT_MS = 10_000;

console.log("[Groq] Model fallback chain:", GROQ_MODELS.join(" → "));

function normalizeGroqApiKey(raw) {
  if (typeof raw !== "string") {
    return "";
  }
  let key = raw.trim();
  if (/^bearer\s+/i.test(key)) {
    key = key.replace(/^bearer\s+/i, "").trim();
  }
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  return key;
}
const STRICT_JSON_INSTRUCTION = `Return ONLY valid JSON.
Do not include markdown, code fences, explanations, or any extra text.
Your response must start with { and end with }.
If the format is carousel, return 3-5 slides.
If the format is post or story, return exactly 1 slide.`;

function logGroqAxiosError(context, model, error) {
  const status = error.response?.status;
  const data = error.response?.data;
  console.error(`[Groq] ${context} (model: ${model})`, {
    status: status ?? null,
    code: error.code ?? null,
    message: error.message,
  });
  if (data !== undefined) {
    console.error("[Groq] Error response body (full):", JSON.stringify(data, null, 2));
  } else if (error.stack) {
    console.error("[Groq] Stack:", error.stack);
  }
}

async function generateContent(prompt) {
  const trimmedKey = normalizeGroqApiKey(process.env.GROQ_API_KEY);
  if (!trimmedKey) {
    console.error(
      "[Groq] GROQ_API_KEY is missing or empty. Set it in .env (backend/ or project root) or the environment."
    );
    throw new Error(USER_FACING_ERROR);
  }
  let lastError;

  for (const model of GROQ_MODELS) {
    try {
      const response = await axios.post(
        GROQ_CHAT_URL,
        {
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 8192,
        },
        {
          headers: {
            Authorization: `Bearer ${trimmedKey}`,
            "Content-Type": "application/json",
          },
          timeout: GROQ_TIMEOUT_MS,
        }
      );

      const text = response?.data?.choices?.[0]?.message?.content;
      if (typeof text !== "string" || !text.trim()) {
        console.error(
          `[Groq] Missing or empty choices[0].message.content (model: ${model}). Raw payload:`,
          JSON.stringify(response?.data ?? null, null, 2)
        );
        lastError = new Error("EMPTY_GROQ_CONTENT");
        continue;
      }

      return text.trim();
    } catch (error) {
      lastError = error;
      logGroqAxiosError("Request failed", model, error);

      const status = error.response?.status;
      const code = error.response?.data?.error?.code;
      if (status === 401 || status === 403) {
        console.error("[Groq] Authentication failed; not retrying other models.");
        throw new Error(USER_FACING_ERROR);
      }
      if (code === "model_decommissioned") {
        console.warn(`[Groq] Model "${model}" decommissioned; trying next in chain.`);
      }
      // 429 or other errors: try next model (rate limits / transient errors may differ per model)
    }
  }

  if (lastError) {
    logGroqAxiosError("All models exhausted — final failure", GROQ_MODELS[GROQ_MODELS.length - 1], lastError);
  }

  throw new Error(USER_FACING_ERROR);
}

function createServiceError(message, options = {}) {
  const error = new Error(message);
  error.status = options.status || 502;
  error.details = options.details;
  return error;
}

function buildGenerationPrompt({ idea, format }) {
  const formatRule = FORMAT_RULES[format] || FORMAT_RULES.post;

  return [
    "You are a senior social media strategist for Cuemath.",
    STRICT_JSON_INSTRUCTION,
    getBrandPromptContext(format),
    "Generation rules:",
    "- Follow the flow: hook -> content -> CTA.",
    "- Keep the writing warm, simple, helpful, and parent-friendly.",
    "- Write for busy Indian parents who want confidence and clarity.",
    "- Keep headlines crisp and bold.",
    "- Every slide must include headline, body, visual_description, bg_color, text_color, and accent_color.",
    "- Use only these colors: #FF6B00, #1A1A2E, #FFFFFF, #FFF4E6, #FFD700.",
    "- Use six-digit hex colors.",
    `- Target format: ${formatRule.label}.`,
    `- Canvas size: ${formatRule.dimensions.width}x${formatRule.dimensions.height}.`,
    "Return this exact top-level shape:",
    '{"slides":[{"slide_number":1,"headline":"string","body":"string","visual_description":"string","bg_color":"#RRGGBB","text_color":"#RRGGBB","accent_color":"#RRGGBB"}],"caption":"string with hashtags"}',
    `Content idea: ${idea}`,
  ].join("\n");
}

function cleanJsonText(rawText) {
  const text = String(rawText || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/^\uFEFF/, "")
    .trim();
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    return text;
  }

  return text.slice(firstBrace, lastBrace + 1).trim();
}

function validateStructuredResponse(parsed, format) {
  const slideCount = Array.isArray(parsed?.slides) ? parsed.slides.length : 0;
  const isValidCount =
    format === "carousel" ? slideCount >= 3 && slideCount <= 5 : slideCount === 1;

  if (!parsed || !Array.isArray(parsed.slides) || typeof parsed.caption !== "string") {
    throw createServiceError("Groq response is missing required fields.", {
      details: JSON.stringify(parsed || {}).slice(0, 1000),
    });
  }

  if (!isValidCount) {
    throw createServiceError("Groq response has an invalid slide count.", {
      details: `Expected ${format === "carousel" ? "3-5" : "1"} slides but received ${slideCount}.`,
    });
  }
}

function parseStructuredResponse(rawText, format) {
  const cleanedText = cleanJsonText(rawText);

  try {
    const parsed = JSON.parse(cleanedText);
    validateStructuredResponse(parsed, format);
    return {
      slides: parsed.slides,
      caption: parsed.caption.trim(),
    };
  } catch (error) {
    if (error.details) {
      throw error;
    }

    throw createServiceError("Invalid JSON from Groq.", {
      details: cleanedText.slice(0, 1000),
    });
  }
}

function splitIntoChunks(text, chunkCount) {
  const cleaned = String(text || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return Array.from({ length: chunkCount }, () => "");
  }

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (!sentences.length) {
    return Array.from({ length: chunkCount }, () => cleaned);
  }

  const chunks = Array.from({ length: chunkCount }, () => []);
  sentences.forEach((sentence, index) => {
    chunks[index % chunkCount].push(sentence);
  });

  return chunks.map((chunk) => chunk.join(" ").trim());
}

function truncate(value, maxLength) {
  const cleaned = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "";
  }

  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength - 3).trim()}...` : cleaned;
}

function buildFallbackSlides(rawText, idea, format) {
  const totalSlides = format === "carousel" ? 3 : 1;
  const chunks = splitIntoChunks(rawText, totalSlides);

  return chunks.map((chunk, index) => {
    const defaultHeadline =
      index === 0
        ? truncate(idea, 80) || "Fresh social media idea"
        : `Key takeaway ${index + 1}`;
    const body =
      truncate(chunk, 220) || "The model returned plain text instead of structured slide JSON.";

    return {
      slide_number: index + 1,
      headline: defaultHeadline,
      body,
      visual_description:
        "A clean, modern social media visual that supports the headline with warm, parent-friendly cues.",
      bg_color: "#FFF4E6",
      text_color: "#1A1A2E",
      accent_color: "#FF6B00",
    };
  });
}

async function generateSlides({ idea, format }) {
  let rawText;

  try {
    rawText = await generateContent(buildGenerationPrompt({ idea, format }));
  } catch (error) {
    throw createServiceError(USER_FACING_ERROR, {
      status: error.status || 502,
      details: error.message,
    });
  }

  try {
    return parseStructuredResponse(rawText, format);
  } catch (error) {
    console.warn("Falling back to plain-text Groq response:", error.details || error.message);

    return {
      slides: buildFallbackSlides(rawText, idea, format),
      caption: String(rawText || "").trim(),
    };
  }
}

module.exports = { generateContent, generateSlides };
