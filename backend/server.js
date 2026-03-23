const databaseconfig = require("./src/config/databaseConfig");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const router = require("./src/routers/index");
const cookieparser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const socketService = require("./src/services/socketService");
const bookingService = require("./src/services/bookingService");
const cron = require("node-cron");
const morgan = require("morgan");
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Khởi tạo socketService (quản lý tập trung)
socketService.init(io);

// Truyền io cho bookingService (backward compat)
bookingService.setIO(io);

// Run every 5 minutes
cron.schedule("*/5 * * * *", () => {
  console.log("Running background job: Auto release expired holds...");
  bookingService.releaseExpiredHolds();
});

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(cookieparser());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", router);

databaseconfig();

server.listen(process.env.PORT || 5000, () => {
  try {
    console.log(
      `server đã được khởi tạo và chạy ở cổng ${process.env.PORT || 5000}`,
    );
  } catch (error) {
    console.error("Lỗi khi khởi tạo server:", error);
  }
});
