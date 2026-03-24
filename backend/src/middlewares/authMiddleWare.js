const jwt = require("jsonwebtoken");
const User = require("../models/users");

const authMiddleWare = {
  verifyAccessToken: async (req, res, next) => {
    try {
      authHeader = req.get("Authorization"); // Lấy token từ header Authorization
      let token = authHeader && authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "không tìm thấy access token" });
      }

      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .json({ message: "Access token không hợp lệ hoặc đã hết hạn" });
        }
        const user = await User.findById(decoded.id).select("-password"); // Lấy thông tin người dùng từ cơ sở dữ liệu trừ mật khẩu
        if (!user) {
          return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        req.user = user; // Gắn thông tin người dùng vào đối tượng req
        console.log("User authenticated:", user);
        next(); // Tiếp tục đến middleware hoặc route handler tiếp theo
      });
    } catch (error) {
      return res.status(500).json({ message: "lỗi hệ thống " });
    }
  },

  verifyAdmin: async (req, res, next) => {
    try {
      await authMiddleWare.verifyAccessToken(req, res, () => {
        if (req.user.role !== "admin") {
          return res.status(403).json({ message: "Yêu cầu quyền admin" });
        }
        next();
      });
    } catch (error) {
      return res.status(500).json({ message: "lỗi hệ thống " });
    }
  },

  /** Admin hoặc staff — dùng cho nội dung FAQ (và có thể mở rộng tương tự news). */
  verifyAdminOrStaff: async (req, res, next) => {
    try {
      await authMiddleWare.verifyAccessToken(req, res, () => {
        const r = req.user?.role;
        if (r !== "admin" && r !== "staff") {
          return res
            .status(403)
            .json({ message: "Yêu cầu tài khoản quản trị hoặc nhân viên" });
        }
        next();
      });
    } catch (error) {
      return res.status(500).json({ message: "lỗi hệ thống " });
    }
  },
};

module.exports = authMiddleWare;
