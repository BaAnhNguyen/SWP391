require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");

require("./config/passport");

const authRoutes = require("./routes/auth");

const app = express();
app.use(cors(), express.json(), passport.initialize());
app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server:${process.env.PORT}`)
    )
  )
  .catch((err) => console.error("DB Err:", err));
