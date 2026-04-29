import express from "express";
import cors from "cors";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from the server");
});

//some configuration
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// cors configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

import healthCheckRouter from "./routes/healthCheck.routes.js";

app.use("/api/v1/healthCheck", healthCheckRouter);

export default app;
