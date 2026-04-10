function slugify(value) {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "social-media-creative";
}

function buildExportPrefix(idea, format) {
  return `${slugify(idea).slice(0, 42)}-${format}`;
}

function buildExportFileName(prefix, slideNumber) {
  return `${prefix}-slide-${slideNumber}.png`;
}

function buildExportManifest({ idea, format, slides }) {
  const prefix = buildExportPrefix(idea, format);
  const safeSlides = Array.isArray(slides) ? slides : [];

  return safeSlides.map((slide, index) => ({
    slide_number: slide.slide_number || index + 1,
    file_name: buildExportFileName(prefix, slide.slide_number || index + 1),
  }));
}

module.exports = {
  buildExportFileName,
  buildExportManifest,
  buildExportPrefix,
};
