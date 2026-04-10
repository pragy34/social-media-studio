const BRAND_CONTEXT = Object.freeze({
  primary: "#FF6B00",
  secondary: "#1A1A2E",
  accent: "#FFD700",
  font: "Inter",
  tone: "warm, simple, parent-friendly",
  audience: "Indian parents",
});

const FORMAT_RULES = Object.freeze({
  post: {
    label: "Instagram Post",
    slideCount: "exactly 1 slide",
    dimensions: {
      width: 1080,
      height: 1080,
    },
  },
  story: {
    label: "Instagram Story",
    slideCount: "exactly 1 slide",
    dimensions: {
      width: 1080,
      height: 1920,
    },
  },
  carousel: {
    label: "Instagram Carousel",
    slideCount: "3 to 5 slides",
    dimensions: {
      width: 1080,
      height: 1080,
    },
  },
});

function getBrandPromptContext(format) {
  const formatRule = FORMAT_RULES[format] || FORMAT_RULES.post;

  return [
    "Brand context for every response:",
    `- Primary color: ${BRAND_CONTEXT.primary}`,
    `- Secondary color: ${BRAND_CONTEXT.secondary}`,
    `- Accent color: ${BRAND_CONTEXT.accent}`,
    `- Font: ${BRAND_CONTEXT.font}`,
    `- Tone: ${BRAND_CONTEXT.tone}`,
    `- Audience: ${BRAND_CONTEXT.audience}`,
    "Format rules:",
    `- Target format: ${formatRule.label}`,
    `- Slide count: ${formatRule.slideCount}`,
    `- Canvas size: ${formatRule.dimensions.width}x${formatRule.dimensions.height}`,
  ].join("\n");
}

module.exports = {
  BRAND_CONTEXT,
  FORMAT_RULES,
  getBrandPromptContext,
};
