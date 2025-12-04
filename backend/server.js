const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config({ path: path.resolve(__dirname, ".env") });
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.ADMIN_ORIGIN || "http://localhost:5173",
  process.env.USER_ORIGIN || "http://localhost:5174",
  "http://localhost:5175", "http://localhost:5177",
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Make io accessible in routes
app.set("io", io);

// Socket.IO Logic
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join_room", ({ role, city, state }) => {
    if (role === "central_admin") {
      socket.join("central_admin");
      console.log(`Socket ${socket.id} joined central_admin`);
    } else if (role === "state_admin") {
      socket.join(`state_${state}`);
      console.log(`Socket ${socket.id} joined state_${state}`);
    } else if (role === "city_admin") {
      socket.join(`city_${city}`);
      console.log(`Socket ${socket.id} joined city_${city}`);
    } else if (role === "user") {
      socket.join(`user_${socket.id}`); // Or user ID if available
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));

// Mock ML Service Route (for testing)
app.post("/api/ml-mock", (req, res) => {
  // Simulate ML processing
  const dangerScore = Math.floor(Math.random() * 100);
  res.json({ danger_score: dangerScore, tags: ["fire", "urgent"] });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
