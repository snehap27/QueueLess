const { Server } = require("socket.io"); // Import the Server class from the socket.io module
const http = require("http"); // Import the http module to create an HTTP server

const express = require("express");
const cors = require("cors");
require("dotenv").config({ quiet: true });

const connectDB = require("./config/db");
const validateEnv = require("./config/validateEnv");

const authRoutes = require("./routes/authRoutes");
const businessRoutes = require("./routes/businessRoutes");
const queueRoutes = require("./routes/queueRoutes");

const app = express();

const server = http.createServer(app); // Create an HTTP server using the Express app

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow requests from this origin
    methods: ["GET", "POST"], // Allow only GET and POST methods
  },
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/queue", queueRoutes);

app.get("/", (req, res) => {
  res.send("QueueLess API is running");
});



const PORT = process.env.PORT;

const startServer = async () => {
  try {
    validateEnv();
    console.log("✓ Environment variables loaded");

    await connectDB();
    console.log("✓ MongoDB connected");

    server.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
