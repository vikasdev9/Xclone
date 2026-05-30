import express from "express";
import { ENV } from "./config/env.js";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import notificationRoutes from "./routes/notification.route.js";

import { connectDB } from "./config/db.js";
import { arcjetMiddleware } from "./middleware/arcjet.middleware.js";

const app = express();

// Validate required environment variables
const missingEnvVars = [];
if (!ENV.CLERK_SECRET_KEY) missingEnvVars.push("CLERK_SECRET_KEY");
if (!ENV.CLOUDINARY_CLOUD_NAME) missingEnvVars.push("CLOUDINARY_CLOUD_NAME");
if (!ENV.CLOUDINARY_API_KEY) missingEnvVars.push("CLOUDINARY_API_KEY");
if (!ENV.CLOUDINARY_API_SECRET) missingEnvVars.push("CLOUDINARY_API_SECRET");

if (missingEnvVars.length > 0) {
  console.error(
    `ERROR: Missing required environment variables:\n${missingEnvVars.map((v) => `  - ${v}`).join("\n")}\n` +
    `Add these to your .env file or deployment environment variables.`,
  );
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.use(clerkMiddleware());
// app.use(arcjetMiddleware);

app.get("/", (req, res) => res.send("Hello from server"));

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});


const startServer = async () => {
  try {
    await connectDB();
 
    // listen for local development
    if (ENV.NODE_ENV !== "production") {
      app.listen(ENV.PORT, () => console.log("Server is up and running on PORT:", ENV.PORT));
    }
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

// app.listen(ENV.PORT,()=>console.log("Server is running on PORT 5001"))

startServer();

// export for vercel
export default app;