import React, { useState, useEffect } from "react";
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
  Menu,
  MenuItem,
  ListItemIcon as MenuItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ExploreIcon from "@mui/icons-material/Explore";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { connectSocket, disconnectSocket } from "../../config/socketClient";
import StaffNotificationBell from "../staff/StaffNotificationBell";
import { signOutUser } from "../../services/authService";

const drawerWidth = 240;

export default function StaffLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const accessToken = useSelector((state) => state.token.accessToken);

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
    if (currentUser.role !== "staff") {
      navigate("/", { replace: true });
      return;
    }
  }, [accessToken, currentUser, navigate]);

  useEffect(() => {
    if (currentUser?._id) {
      connectSocket(currentUser._id, currentUser.role || "staff");
    }
    return () => {
      disconnectSocket();
    };
  }, [currentUser?._id]);

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
    navigate("/staff/profile");
    handleCloseAvatarMenu();
  };

  const menuItems = [
    {
      text: "Tư vấn khách hàng",
      icon: <AssignmentIcon />,
      path: "/staff/assignments",
    },
    { text: "Tour được phân", icon: <ExploreIcon />, path: "/staff/tours" },
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
          OXALIS STAFF
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
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
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path ? "#2b6f56" : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight:
                    location.pathname === item.path ? "bold" : "normal",
                  color:
                    location.pathname === item.path ? "#2b6f56" : "inherit",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
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
            Khu vực Nhân viên
          </Typography>
          <StaffNotificationBell />
          <IconButton onClick={handleOpenAvatarMenu} sx={{ p: 0, ml: 1 }}>
            <Avatar sx={{ bgcolor: "#2b6f56" }}>
              {(currentUser?.fullName || currentUser?.username || "NV")
                .charAt(0)
                .toUpperCase()}
            </Avatar>
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

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="staff folders"
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
