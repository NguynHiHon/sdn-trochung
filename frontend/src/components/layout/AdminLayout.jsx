import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Popover,
  CircularProgress,
  Button,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon as MenuItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CollectionsIcon from "@mui/icons-material/Collections";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExploreIcon from "@mui/icons-material/Explore";
import LandscapeIcon from "@mui/icons-material/Landscape";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PeopleIcon from "@mui/icons-material/People";
import PostAddIcon from "@mui/icons-material/PostAdd";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { io } from "socket.io-client";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../../services/notificationApi";
import { signOutUser } from "../../services/authService";

const drawerWidth = 260;
const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:9999";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const accessToken = useSelector((state) => state.token.accessToken);

  // Notification state
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);

  // Avatar dropdown state
  const [avatarAnchor, setAvatarAnchor] = useState(null);

  // Check authentication on mount and token changes
  useEffect(() => {
    const token = accessToken || localStorage.getItem("accessToken");
    if (!token || !currentUser) {
      navigate("/signin", { replace: true });
      return;
    }

    // Verify user role
    if (currentUser.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }
  }, [accessToken, currentUser, navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Avatar dropdown handlers
  const handleOpenAvatarMenu = (event) => {
    setAvatarAnchor(event.currentTarget);
  };

  const handleCloseAvatarMenu = () => {
    setAvatarAnchor(null);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOutUser(dispatch, navigate);
      handleCloseAvatarMenu();
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout API fails, still clear frontend state
      handleCloseAvatarMenu();
    }
  };

  // Profile handler
  const handleProfile = () => {
    navigate("/manager/profile");
    handleCloseAvatarMenu();
  };

  // Fetch unread count initially
  useEffect(() => {
    getUnreadCount()
      .then((res) => {
        if (res.success) setUnreadCount(res.count);
      })
      .catch(() => { });
  }, []);

  // Socket.IO connection
  useEffect(() => {
    let userId = currentUser?._id || currentUser?.id || null;
    let role = currentUser?.role || null;

    const token = accessToken || localStorage.getItem("accessToken");
    if ((!userId || !role) && token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = userId || payload.id;
        role = role || payload.role;
      } catch {
        // ignore malformed token
      }
    }

    if (!userId || !role) return;

    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });

    socket.on("connect", () => {
      console.log("[Socket] Connected to server! Socket ID:", socket.id);
      console.log("[Socket] Emitting register with:", { userId, role });
      socket.emit("register", { userId, role });
    });

    socket.on("newNotification", (notif) => {
      console.log("🔔 [Socket] RECEIVED NEW NOTIFICATION:", notif);
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [notif, ...prev]);

      // Hiển thị popup toast bên cạnh việc tăng số đếm đỏ
      import("sonner").then(({ toast }) => {
        toast.success(notif.title, {
          description: notif.content,
          duration: 6000,
        });
      });
    });

    return () => socket.disconnect();
  }, [currentUser, accessToken]);

  const handleOpenNotifications = async (event) => {
    setNotifAnchor(event.currentTarget);
    setNotifLoading(true);
    try {
      const res = await getMyNotifications({ page: 1, limit: 10 });
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch {
      // ignore fetch errors
    }
    setNotifLoading(false);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClickNotif = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n)),
      );
    }
    setNotifAnchor(null);
    // Navigate to related page
    if (notif.type === "new_booking") navigate("/manager/bookings");
    else if (notif.type === "assignment") navigate("/manager/bookings");
  };

  const getNotifColor = (type) => {
    switch (type) {
      case "new_booking":
        return "#2b6f56";
      case "assignment":
        return "#1976d2";
      case "booking_confirmed":
        return "#4caf50";
      case "booking_cancelled":
        return "#f44336";
      default:
        return "#666";
    }
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/manager" },
    {
      text: "Quản lý Booking",
      icon: <ConfirmationNumberIcon />,
      path: "/manager/bookings",
    },
    {
      text: "Quản lý Lịch",
      icon: <CalendarMonthIcon />,
      path: "/manager/schedules",
    },
    { text: "Quản lý Tour", icon: <ExploreIcon />, path: "/manager/tours" },
    {
      text: "Quản lý Hang Động",
      icon: <LandscapeIcon />,
      path: "/manager/caves",
    },
    { text: "Thư viện ảnh", icon: <CollectionsIcon />, path: "/manager/media" },
    {
      text: "Quản lý bài đăng",
      icon: <PostAddIcon />,
      path: "/manager/posts",
      matchPaths: ["/manager/posts", "/manager/news/articles"],
    },
    {
      text: "Quản lý Tài khoản",
      icon: <PeopleIcon />,
      path: "/manager/accounts",
    },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ fontWeight: "bold", color: "#2b6f56" }}
        >
          OXALIS ADMIN
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const selected = item.matchPaths
            ? item.matchPaths.some(
              (p) =>
                location.pathname === p ||
                location.pathname.startsWith(p + "/"),
            )
            : location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "rgba(43,111,86,0.08)",
                    borderRight: "3px solid #2b6f56",
                  },
                }}
              >
                <ListItemIcon sx={{ color: selected ? "#2b6f56" : "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: selected ? "bold" : "normal",
                    color: selected ? "#2b6f56" : "inherit",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}
    >
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "#ffffff",
          color: "#333",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Hệ Thống Quản Trị
          </Typography>

          {/* 🔔 Notification Bell */}
          <IconButton
            color="inherit"
            onClick={handleOpenNotifications}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton onClick={handleOpenAvatarMenu} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: "#2b6f56" }}>AD</Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Avatar Dropdown Menu */}
      <Menu
        anchorEl={avatarAnchor}
        open={Boolean(avatarAnchor)}
        onClose={handleCloseAvatarMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1,
              minWidth: 150,
            },
          },
        }}
      >
        <MenuItem onClick={handleProfile}>
          <MenuItemIcon>
            <AccountCircleIcon fontSize="small" />
          </MenuItemIcon>
          Hồ sơ
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: "#d32f2f" }}>
          <MenuItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: "#d32f2f" }} />
          </MenuItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>

      {/* Notification Popover */}
      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={() => setNotifAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: 380, maxHeight: 480, borderRadius: 2 } }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid #eee",
          }}
        >
          <Typography fontWeight="bold" fontSize="1rem">
            Thông báo
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllRead}
              sx={{ textTransform: "none", fontSize: "0.8rem" }}
            >
              Đọc tất cả
            </Button>
          )}
        </Box>
        {notifLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color="#999">Không có thông báo</Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 380, overflowY: "auto" }}>
            {notifications.map((n) => (
              <Box
                key={n._id}
                onClick={() => handleClickNotif(n)}
                sx={{
                  px: 2,
                  py: 1.5,
                  cursor: "pointer",
                  bgcolor: n.isRead ? "transparent" : "rgba(43,111,86,0.04)",
                  borderBottom: "1px solid #f5f5f5",
                  "&:hover": { bgcolor: "#f5f5f5" },
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: n.isRead ? "transparent" : getNotifColor(n.type),
                    mt: 0.8,
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    fontSize="0.85rem"
                    fontWeight={n.isRead ? 400 : 700}
                    noWrap
                  >
                    {n.title}
                  </Typography>
                  <Typography
                    fontSize="0.78rem"
                    color="#666"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {n.content}
                  </Typography>
                  <Typography fontSize="0.7rem" color="#aaa" mt={0.3}>
                    {new Date(n.createdAt).toLocaleString("vi-VN")}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Popover>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="admin folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid #eee",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
