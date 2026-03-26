import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ExploreIcon from "@mui/icons-material/Explore";
import { connectSocket, disconnectSocket } from "../../config/socketClient";
import StaffNotificationBell from "../staff/StaffNotificationBell";

const drawerWidth = 240;

export default function StaffLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.currentUser);

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

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/staff" },
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
        {menuItems.map((item) => {
          const isActive =
            item.path === "/staff"
              ? location.pathname === "/staff"
              : location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive}
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
                <ListItemIcon sx={{ color: isActive ? "#2b6f56" : "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? "bold" : "normal",
                    color: isActive ? "#2b6f56" : "inherit",
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
            Khu vực Nhân viên
          </Typography>
          <StaffNotificationBell />
          <Avatar sx={{ bgcolor: "#2b6f56", ml: 1 }}>
            {(currentUser?.fullName || currentUser?.username || "NV")
              .charAt(0)
              .toUpperCase()}
          </Avatar>
        </Toolbar>
      </AppBar>

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
