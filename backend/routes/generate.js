const express = require("express");

const { generateSlides } = require("../services/aiService");
const {
  normalizeSlides,
  renderSlides,
  getSlideDimensions,
} = require("../services/renderService");
const { buildExportManifest, buildExportPrefix } = require("../services/exportService");

const router = express.Router();
const ALLOWED_FORMATS = new Set(["post", "story", "carousel"]);
const FRIENDLY_GENERATION_ERROR = "Unable to generate content. Please try again.";

router.post("/", async (req, res) => {
  const idea = typeof req.body?.idea === "string" ? req.body.idea.trim() : "";
  const format =
    typeof req.body?.format === "string" ? req.body.format.toLowerCase() : "";

  if (!idea) {
    res.status(400).json({ error: "Please describe your content idea." });
    return;
  }

  if (!ALLOWED_FORMATS.has(format)) {
    res.status(400).json({ error: "Format must be post, story, or carousel." });
    return;
  }

  try {
    const result = await generateSlides({ idea, format });
    const slides = normalizeSlides(result.slides, format);
    const dimensions = getSlideDimensions(format);
    const exportPrefix = buildExportPrefix(idea, format);
    const exportManifest = buildExportManifest({ idea, format, slides });

    renderSlides(slides, format);

    res.set("X-Export-Prefix", exportPrefix);
    res.set("X-Slide-Width", String(dimensions.width));
    res.set("X-Slide-Height", String(dimensions.height));
    res.set("X-Slide-Count", String(exportManifest.length));

    res.json({
      slides,
      caption: result.caption,
    });
  } catch (error) {
    console.error("Generate route error:", error.message);
    if (error.details) {
      console.error("Model output snippet:", error.details);
    }

    res.status(error.status || 500).json({
      error: FRIENDLY_GENERATION_ERROR,
    });
  }
});

module.exports = router;
