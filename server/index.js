const express = require("express");
const cors = require("cors");
require("dotenv").config({ quiet: true });

const connectDB = require("./config/db");
const validateEnv = require("./config/validateEnv");
const authRoutes = require("./routes/authRoutes");
const businessRoutes = require("./routes/businessRoutes");
const queueRoutes = require("./routes/queueRoutes");


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/business", businessRoutes);


app.get("/", (req, res) => {
  res.send("QueueLess API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/queue", queueRoutes);

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    validateEnv();
    console.log("✓ Environment variables loaded");

    await connectDB();
    console.log("✓ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
