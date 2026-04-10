const { FORMAT_RULES } = require("../utils/brandContext");
const DESIGN_PALETTE = Object.freeze({
  primary: "#FF6B00",
  dark: "#1A1A2E",
  light: "#FFFFFF",
  soft: "#FFF4E6",
  accent: "#FFD700",
});

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function collapseText(value, fallback, maxLength) {
  const cleaned = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return fallback;
  }

  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength - 3).trim()}...` : cleaned;
}

function getSlideTheme(index, totalSlides, format) {
  if (totalSlides === 1) {
    return format === "story"
      ? {
          bg_color: DESIGN_PALETTE.dark,
          text_color: DESIGN_PALETTE.light,
          accent_color: DESIGN_PALETTE.primary,
        }
      : {
          bg_color: DESIGN_PALETTE.soft,
          text_color: DESIGN_PALETTE.dark,
          accent_color: DESIGN_PALETTE.primary,
        };
  }

  if (index === 0) {
    return {
      bg_color: DESIGN_PALETTE.dark,
      text_color: DESIGN_PALETTE.light,
      accent_color: DESIGN_PALETTE.primary,
    };
  }

  if (index === totalSlides - 1) {
    return {
      bg_color: DESIGN_PALETTE.primary,
      text_color: DESIGN_PALETTE.light,
      accent_color: DESIGN_PALETTE.accent,
    };
  }

  return index % 2 === 1
    ? {
        bg_color: DESIGN_PALETTE.soft,
        text_color: DESIGN_PALETTE.dark,
        accent_color: DESIGN_PALETTE.primary,
      }
    : {
        bg_color: DESIGN_PALETTE.dark,
        text_color: DESIGN_PALETTE.light,
        accent_color: DESIGN_PALETTE.accent,
      };
}

function createFallbackSlide(index, totalSlides, format) {
  const theme = getSlideTheme(index, totalSlides, format);

  if (index === 0) {
    return {
      headline: "Turn one learning moment into a confident habit",
      body: "Small, steady routines help kids feel calmer and more ready to learn every day.",
      visual_description:
        "A warm parent-child study moment at home with simple desk items and soft evening light.",
      ...theme,
    };
  }

  if (index === totalSlides - 1) {
    return {
      headline: "Try one simple step tonight",
      body: "Pick one routine, keep it light, and celebrate the little wins together.",
      visual_description:
        "A cheerful checklist near a study table with one highlighted action and a warm family setting.",
      ...theme,
    };
  }

  return {
    headline: "Keep the routine easy to follow",
    body: "Clear instructions, gentle encouragement, and short practice windows make it easier to stay consistent.",
    visual_description:
      "Simple illustrated study cues, a tidy table, and a parent guiding a child with a smile.",
    ...theme,
  };
}

function normalizeSlide(slide, index, totalSlides, format) {
  const fallback = createFallbackSlide(index, totalSlides, format);
  const source = slide && typeof slide === "object" ? slide : {};
  const theme = getSlideTheme(index, totalSlides, format);

  return {
    slide_number: index + 1,
    headline: collapseText(source.headline, fallback.headline, 90),
    body: collapseText(source.body, fallback.body, 240),
    visual_description: collapseText(
      source.visual_description,
      fallback.visual_description,
      220
    ),
    bg_color: theme.bg_color,
    text_color: theme.text_color,
    accent_color: theme.accent_color,
  };
}

function normalizeSlides(slides, format) {
  const safeSlides = Array.isArray(slides) ? slides.slice() : [];
  const requestedTotal =
    format === "carousel" ? Math.min(5, Math.max(3, safeSlides.length || 3)) : 1;

  while (safeSlides.length < requestedTotal) {
    safeSlides.push(createFallbackSlide(safeSlides.length, requestedTotal, format));
  }

  return safeSlides
    .slice(0, requestedTotal)
    .map((slide, index) => normalizeSlide(slide, index, requestedTotal, format));
}

function getSlideDimensions(format) {
  const formatRule = FORMAT_RULES[format] || FORMAT_RULES.post;
  return formatRule.dimensions;
}

function renderIndicators(slideIndex, totalSlides, accentColor) {
  if (totalSlides <= 1) {
    return "";
  }

  return `
    <div style="position:absolute;left:60px;right:60px;bottom:42px;display:flex;justify-content:center;gap:10px;">
      ${Array.from({ length: totalSlides }, (_value, index) => {
        const background = index === slideIndex ? accentColor : "rgba(255,255,255,0.28)";
        return `<span style="width:12px;height:12px;border-radius:999px;background:${background};display:block;"></span>`;
      }).join("")}
    </div>
  `;
}

function renderSlideHtml(slide, options = {}) {
  const { format = "post", slideIndex = 0, totalSlides = 1 } = options;
  const { width, height } = getSlideDimensions(format);

  return `
    <section style="position:relative;width:${width}px;height:${height}px;overflow:hidden;border-radius:36px;padding:60px;box-sizing:border-box;background:${escapeHtml(
      slide.bg_color
    )};color:${escapeHtml(
      slide.text_color
    )};font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at top left, ${escapeHtml(
        slide.accent_color
      )}33, transparent 36%), radial-gradient(circle at bottom right, ${escapeHtml(
        slide.accent_color
      )}22, transparent 28%);"></div>
      <div style="position:relative;z-index:1;max-width:780px;display:grid;gap:24px;">
        <div style="font-size:18px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${escapeHtml(
          slide.accent_color
        )};">Cuemath Creative</div>
        <h1 style="margin:0;font-size:${format === "story" ? "76px" : "72px"};line-height:1.05;font-weight:800;">${escapeHtml(
          slide.headline
        )}</h1>
        <p style="margin:0;font-size:${format === "story" ? "30px" : "28px"};line-height:1.6;opacity:0.94;">${escapeHtml(
          slide.body
        )}</p>
        <div style="margin:0 auto;max-width:650px;padding:18px 22px;border-radius:22px;background:rgba(255,255,255,0.14);backdrop-filter:blur(8px);font-size:20px;line-height:1.5;">
          Visual: ${escapeHtml(slide.visual_description)}
        </div>
      </div>
      <div style="position:absolute;right:34px;bottom:26px;font-size:24px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;opacity:0.9;">Cuemath</div>
      ${renderIndicators(slideIndex, totalSlides, slide.accent_color)}
    </section>
  `;
}

function renderSlides(slides, format) {
  return slides.map((slide, index) =>
    renderSlideHtml(slide, {
      format,
      slideIndex: index,
      totalSlides: slides.length,
    })
  );
}

module.exports = {
  getSlideDimensions,
  normalizeSlides,
  renderSlideHtml,
  renderSlides,
};
