import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});

import express from "express";

import authRouter from "./routes/auth";
import businessesRouter from "./routes/businesses";
import cardsRouter from "./routes/cards";
import publicRouter from "./routes/public";

const app = express();
const PORT = 3000;

const websitePath = path.resolve(process.cwd(), "../Website");

const mainPath = path.join(websitePath, "Main");
const inactivePath = path.join(websitePath, "Inactive");
const adminPath = path.join(websitePath, "Admin");

app.use(express.json());

// API routes
app.use("/api/auth", authRouter);
app.use("/api/businesses", businessesRouter);
app.use("/api/cards", cardsRouter);

// Public card routes
app.use(publicRouter);

// Admin website
app.get("/admin", (_req, res) => {
  res.sendFile(path.join(adminPath, "index.html"));
});

app.use("/admin", express.static(adminPath));

// Inactive card page
app.get("/inactive", (_req, res) => {
  res.sendFile(path.join(inactivePath, "index.html"));
});

// Main public website
app.use(express.static(mainPath));

console.log("About to start Express...");

const server = app.listen(PORT, "127.0.0.1", () => {
  console.log(
    `ProtoxTap V2 backend running at http://127.0.0.1:${PORT}`
  );
});

server.on("error", (error) => {
  console.error("SERVER ERROR:", error);
});

server.on("close", () => {
  console.log("SERVER CLOSED");
});
