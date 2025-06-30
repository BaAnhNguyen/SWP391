require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");

require("./config/passport");

const authRoutes = require("./routes/auth");
const userRouter = require("./routes/user");
const donateRegistrationRoutes = require("./routes/donateRegistration");
const needRequestRoutes = require("./routes/needRequest");
const donationHistoryRoutes = require("./routes/donationHistory");
const questionRoutes = require("./routes/Question");
const bloodUnitRoutes = require("./routes/bloodUnit");
const blogRoutes = require("./routes/blog");
const commentRoutes = require("./routes/comment");
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRouter);

// Ensure consistency by registering both uppercase and lowercase versions
app.use("/api/donateRegistration", donateRegistrationRoutes);
app.use("/api/donateregistration", donateRegistrationRoutes); // Added lowercase version
app.use("/api/needRequest", needRequestRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/bloodUnit", bloodUnitRoutes);

app.use("/api/donationHistory", donationHistoryRoutes);
app.use("api/blog", blogRoutes);
app.use("api/comment", commentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/swp391";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });
