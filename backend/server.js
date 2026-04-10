const path = require("path");
const dotenv = require("dotenv");

// Load before other modules so env is set when the process starts (cwd may be repo root).
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const groqKey = process.env.GROQ_API_KEY;
if (typeof groqKey !== "string" || !groqKey.trim()) {
  console.warn(
    "[Groq] GROQ_API_KEY is not set. Add it to backend/.env or project root .env (see .env.example)."
  );
}

const express = require("express");

const generateRoute = require("./routes/generate");

const app = express();
const PORT = process.env.PORT || 3000;
const frontendDir = path.join(__dirname, "..", "frontend");
const htmlToImageDir = path.join(
  __dirname,
  "..",
  "node_modules",
  "html-to-image",
  "dist"
);

app.disable("x-powered-by");

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/vendor", express.static(htmlToImageDir, { maxAge: "1d" }));
app.use(express.static(frontendDir));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/generate", generateRoute);

app.use((req, res, next) => {
  if (req.method !== "GET") {
    next();
    return;
  }

  if (
    req.path.startsWith("/generate") ||
    req.path.startsWith("/health") ||
    req.path.startsWith("/vendor")
  ) {
    next();
    return;
  }

  res.sendFile(path.join(frontendDir, "index.html"));
});

function startServer(port = PORT) {
  return app.listen(port, () => {
    console.log(`Social Media Studio running on http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
};
