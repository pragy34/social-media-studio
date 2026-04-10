const ENHANCED_FORMAT_META = {
  post: {
    label: "Post",
    icon: "P",
    note: "Square layout for evergreen feed content.",
    ratio: "1 / 1",
  },
  story: {
    label: "Story",
    icon: "S",
    note: "Vertical mobile-first story composition.",
    ratio: "9 / 16",
  },
  carousel: {
    label: "Carousel",
    icon: "C",
    note: "Hook, teach, and close with a clear CTA.",
    ratio: "1 / 1",
  },
};

const EXAMPLE_IDEAS = [
  "Why kids forget math",
  "How to build confidence in children",
  "Benefits of practice in learning",
];

function enhanceTopbar() {
  const pageShell = document.querySelector(".page-shell");
  const hero = document.querySelector(".hero");

  if (!pageShell || !hero || pageShell.querySelector(".app-topbar")) {
    return;
  }

  pageShell.insertAdjacentHTML(
    "afterbegin",
    `
      <div class="app-topbar">
        <div class="app-brand">
          <div class="app-brand-mark">SM</div>
          <div class="app-brand-copy">
            <strong>Social Media Studio</strong>
            <span>Premium creative workflow for Cuemath</span>
          </div>
        </div>
        <div class="app-status">Backend connected</div>
      </div>
    `
  );
}

function enhanceFormatButtons() {
  const buttons = Array.from(document.querySelectorAll(".format-pill"));

  buttons.forEach((button) => {
    const meta = ENHANCED_FORMAT_META[button.dataset.format];
    if (!meta || button.dataset.enhanced === "true") {
      return;
    }

    button.innerHTML = `
      <span class="format-icon">${meta.icon}</span>
      <span class="format-name">${meta.label}</span>
      <span class="format-note">${meta.note}</span>
    `;
    button.dataset.enhanced = "true";
  });
}

function enhanceEmptyState() {
  const emptyState = document.getElementById("emptyState");
  if (!emptyState || emptyState.dataset.enhanced === "true") {
    return;
  }

  emptyState.innerHTML = `
    <div class="empty-state-content">
      <strong>Enter an idea above to generate your social media content</strong>
      <span>
        Start with a simple topic and the workspace will create polished slides,
        caption copy, and export-ready previews.
      </span>
      <div class="example-list">
        ${EXAMPLE_IDEAS.map(
          (idea) =>
            `<button class="example-pill" type="button" data-example-idea="${idea}">${idea}</button>`
        ).join("")}
      </div>
    </div>
  `;
  emptyState.dataset.enhanced = "true";
}

function bindExampleIdeas() {
  const emptyState = document.getElementById("emptyState");
  const ideaInput = document.getElementById("ideaInput");

  if (!emptyState || !ideaInput || emptyState.dataset.examplesBound === "true") {
    return;
  }

  emptyState.addEventListener("click", (event) => {
    const button = event.target.closest("[data-example-idea]");
    if (!button) {
      return;
    }

    ideaInput.value = button.dataset.exampleIdea;
    ideaInput.dispatchEvent(new Event("input", { bubbles: true }));
    ideaInput.focus();
    ideaInput.setSelectionRange(ideaInput.value.length, ideaInput.value.length);
  });

  emptyState.dataset.examplesBound = "true";
}

function enhanceResultsHeader() {
  const resultsHeader = document.querySelector(".results-header");
  if (!resultsHeader || resultsHeader.querySelector(".results-header-badge")) {
    return;
  }

  resultsHeader.insertAdjacentHTML(
    "beforeend",
    '<div class="results-header-badge is-neutral">Preview mode</div>'
  );
}

function getResultsBadge() {
  return document.querySelector(".results-header-badge");
}

function setResultsBadge(label, tone = "neutral") {
  const badge = getResultsBadge();
  if (!badge) {
    return;
  }

  badge.textContent = label;
  badge.classList.remove("is-neutral", "is-loading", "is-success", "is-error");
  badge.classList.add(`is-${tone}`);
}

function ensureLoadingState() {
  const resultsSection = document.getElementById("resultsSection");
  if (!resultsSection || document.getElementById("loadingState")) {
    return;
  }

  const loadingState = document.createElement("div");
  loadingState.id = "loadingState";
  loadingState.setAttribute("aria-live", "polite");
  resultsSection.appendChild(loadingState);
}

function ensureToastRegion() {
  if (document.getElementById("toastRegion")) {
    return;
  }

  const region = document.createElement("div");
  region.id = "toastRegion";
  region.className = "app-toast-region";
  region.setAttribute("aria-live", "polite");
  region.setAttribute("aria-atomic", "true");
  document.body.appendChild(region);
}

function showToast(message, tone = "success") {
  const toastRegion = document.getElementById("toastRegion");
  if (!toastRegion || !message) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = `app-toast is-${tone}`;
  toast.textContent = message;
  toastRegion.appendChild(toast);

  window.requestAnimationFrame(() => {
    toast.classList.add("visible");
  });

  window.setTimeout(() => {
    toast.classList.remove("visible");
    window.setTimeout(() => {
      toast.remove();
    }, 220);
  }, 2200);
}

function getActiveFormat() {
  return (
    document.querySelector(".format-pill.active")?.dataset.format ||
    document.querySelector("[data-format].active")?.dataset.format ||
    "post"
  );
}

function buildLoadingCard(ratio) {
  return `
    <article class="loading-card" style="--preview-ratio:${ratio}">
      <div class="loading-top">
        <div class="loading-inline">
          <div class="loading-circle"></div>
          <div class="loading-stack">
            <div class="loading-line medium"></div>
            <div class="loading-line short"></div>
          </div>
        </div>
        <div class="loading-inline">
          <div class="loading-line short"></div>
          <div class="loading-line short"></div>
        </div>
      </div>
      <div class="loading-block"></div>
      <div class="loading-stack">
        <div class="loading-line long"></div>
        <div class="loading-line long"></div>
        <div class="loading-line medium"></div>
      </div>
      <div class="loading-stack">
        <div class="loading-line long"></div>
        <div class="loading-line medium"></div>
      </div>
    </article>
  `;
}

function renderLoadingSkeleton() {
  const loadingState = document.getElementById("loadingState");
  if (!loadingState) {
    return;
  }

  const format = getActiveFormat();
  const meta = ENHANCED_FORMAT_META[format] || ENHANCED_FORMAT_META.post;
  const count = format === "carousel" ? 3 : 1;

  loadingState.innerHTML = `
    <div class="loading-grid">
      ${Array.from({ length: count }, () => buildLoadingCard(meta.ratio)).join("")}
    </div>
  `;
}

function setLoadingStateFromButton() {
  const generateButton = document.getElementById("generateButton");
  const generateButtonLabel = document.getElementById("generateButtonLabel");
  const resultsSection = document.getElementById("resultsSection");
  const resultsMeta = document.getElementById("resultsMeta");
  const slidesGrid = document.getElementById("slidesGrid");

  if (!generateButton || !generateButtonLabel || !resultsSection || !resultsMeta || !slidesGrid) {
    return;
  }

  const isLoading = generateButton.classList.contains("loading");
  const hasSlides = Boolean(slidesGrid.querySelector(".slide-card"));

  if (isLoading) {
    generateButtonLabel.textContent = "Generating your workspace...";
    renderLoadingSkeleton();
    resultsSection.classList.add("is-loading");
    setResultsBadge("Generating", "loading");
    resultsMeta.textContent =
      getActiveFormat() === "carousel"
        ? "Generating your carousel storyboard, preview frames, and caption..."
        : "Generating your premium single-slide preview and caption...";
    return;
  }

  generateButtonLabel.textContent = "Generate premium creatives";
  resultsSection.classList.remove("is-loading");

  if (hasSlides) {
    setResultsBadge("Slides ready!", "success");
    return;
  }

  setResultsBadge("Preview mode", "neutral");
}

function watchLoadingState() {
  const generateButton = document.getElementById("generateButton");
  if (!generateButton || generateButton.dataset.loadingObserved === "true") {
    return;
  }

  const observer = new MutationObserver(() => {
    setLoadingStateFromButton();
  });

  observer.observe(generateButton, {
    attributes: true,
    attributeFilter: ["class", "disabled"],
  });

  document.querySelectorAll("[data-format]").forEach((button) => {
    button.addEventListener("click", () => {
      window.requestAnimationFrame(setLoadingStateFromButton);
    });
  });

  generateButton.dataset.loadingObserved = "true";
}

function decoratePreviewFrames() {
  const cards = Array.from(document.querySelectorAll(".slide-card"));

  cards.forEach((card) => {
    const shell = card.querySelector(".preview-shell");
    if (!shell || shell.dataset.enhanced === "true") {
      return;
    }

    shell.insertAdjacentHTML(
      "afterbegin",
      `
        <div class="preview-frame-head">
          <div class="profile-chip">
            <div class="profile-ring"><i></i></div>
            <div class="profile-lines">
              <strong>cuemath</strong>
              <span>Promoted | For parents</span>
            </div>
          </div>
          <div class="frame-menu">&#8226;&#8226;&#8226;</div>
        </div>
      `
    );

    shell.insertAdjacentHTML(
      "beforeend",
      `
        <div class="preview-frame-foot">
          <div class="action-strip">
            <i>&#9825;</i>
            <i>&#9675;</i>
            <i>&#10148;</i>
          </div>
          <div class="frame-metadata">Instagram preview</div>
        </div>
      `
    );

    shell.dataset.enhanced = "true";
  });
}

function watchPreviewCards() {
  const slidesGrid = document.getElementById("slidesGrid");
  if (!slidesGrid || slidesGrid.dataset.previewObserved === "true") {
    return;
  }

  const observer = new MutationObserver(() => {
    decoratePreviewFrames();
    setLoadingStateFromButton();
  });

  observer.observe(slidesGrid, {
    childList: true,
    subtree: true,
  });

  slidesGrid.dataset.previewObserved = "true";
  decoratePreviewFrames();
}

function listenForStudioEvents() {
  if (window.__studioEventsBound) {
    return;
  }

  window.addEventListener("studio:generation-success", (event) => {
    const message = event.detail?.message || "Slides ready!";
    setResultsBadge(message, "success");
    showToast(message, "success");
  });

  window.addEventListener("studio:generation-error", () => {
    setResultsBadge("Try again", "error");
  });

  window.addEventListener("studio:caption-copied", (event) => {
    showToast(event.detail?.message || "Copied to clipboard!", "success");
  });

  window.__studioEventsBound = true;
}

function enhanceUI() {
  document.body.classList.add("enhanced-ui");
  enhanceTopbar();
  enhanceFormatButtons();
  enhanceEmptyState();
  bindExampleIdeas();
  enhanceResultsHeader();
  ensureLoadingState();
  ensureToastRegion();
  watchLoadingState();
  watchPreviewCards();
  listenForStudioEvents();
  setLoadingStateFromButton();
}

window.addEventListener("load", enhanceUI);
