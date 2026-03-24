import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Grid,
  Divider,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Snackbar,
  LinearProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { updateUserInfo } from "../../redux/slices/authSlice";

const StaffProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Mock data for staff performance (in real app, this would come from API)
  const [staffStats, setStaffStats] = useState({
    totalAssignments: 24,
    completedAssignments: 20,
    pendingAssignments: 4,
    customerRating: 4.7,
    experienceMonths: 8,
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== "staff") {
      navigate("/staff/assignments", { replace: true });
      return;
    }

    // Initialize form with current user data
    setEditForm({
      fullName: currentUser.fullName || "",
      email: currentUser.email || "",
      phone: currentUser.phone || "",
    });
  }, [currentUser, navigate]);

  const handleOpenEditDialog = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    // Reset form
    setEditForm({
      fullName: currentUser.fullName || "",
      email: currentUser.email || "",
      phone: currentUser.phone || "",
    });
  };

  const handleFormChange = (field) => (event) => {
    setEditForm({
      ...editForm,
      [field]: event.target.value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      // Here you would typically call an API to update the profile
      // For now, we'll just update the Redux store
      dispatch(updateUserInfo(editForm));

      setSnackbar({
        open: true,
        message: "Cập nhật hồ sơ thành công!",
        severity: "success",
      });

      setEditDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Có lỗi xảy ra khi cập nhật hồ sơ!",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const completionRate = Math.round(
    (staffStats.completedAssignments / staffStats.totalAssignments) * 100
  );

  if (!currentUser) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        py: 4,
        px: 3,
      }}
    >
      <Box sx={{ maxWidth: 1000, mx: "auto" }}>
        {/* Header */}
        <Typography
          variant="h4"
          fontWeight="bold"
          color="#2b6f56"
          gutterBottom
          sx={{ mb: 4 }}
        >
          Hồ sơ Nhân viên
        </Typography>

        <Grid container spacing={3}>
          {/* Main Profile Card */}
          <Grid item xs={12} md={7}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                border: "1px solid #e1e5e9",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Profile Header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: "#2b6f56",
                        fontSize: "2rem",
                        fontWeight: "bold",
                        boxShadow: "0 4px 12px rgba(43,111,86,0.3)",
                      }}
                    >
                      {(currentUser.fullName || currentUser.username || "S")
                        .charAt(0)
                        .toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {currentUser.fullName || currentUser.username}
                      </Typography>
                      <Chip
                        icon={<WorkIcon />}
                        label="Nhân viên tư vấn"
                        color="primary"
                        size="small"
                        sx={{
                          mt: 1,
                          bgcolor: "#2b6f56",
                          color: "white",
                        }}
                      />
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleOpenEditDialog}
                    sx={{
                      borderColor: "#2b6f56",
                      color: "#2b6f56",
                      "&:hover": {
                        borderColor: "#1e5a44",
                        bgcolor: "rgba(43,111,86,0.04)",
                      },
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Profile Information */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <PersonIcon sx={{ color: "#2b6f56", mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Tên đăng nhập
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="text.primary">
                      {currentUser.username}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <PersonIcon sx={{ color: "#2b6f56", mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Họ và tên
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="text.primary">
                      {currentUser.fullName || "Chưa cập nhật"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <EmailIcon sx={{ color: "#2b6f56", mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="text.primary">
                      {currentUser.email || "Chưa cập nhật"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <BadgeIcon sx={{ color: "#2b6f56", mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Số điện thoại
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="text.primary">
                      {currentUser.phone || "Chưa cập nhật"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CalendarIcon sx={{ color: "#2b6f56", mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Ngày tham gia
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="text.primary">
                      {currentUser.createdAt
                        ? new Date(currentUser.createdAt).toLocaleDateString(
                          "vi-VN"
                        )
                        : "Không xác định"}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Stats Card */}
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                border: "1px solid #e1e5e9",
                background: "linear-gradient(135deg, #2b6f56 0%, #4a9b7e 100%)",
                color: "white",
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Hiệu suất làm việc
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Hoàn thành công việc
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {completionRate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={completionRate}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "white",
                        },
                      }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Tổng số task
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {staffStats.totalAssignments}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Hoàn thành
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {staffStats.completedAssignments}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Đang xử lý
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {staffStats.pendingAssignments}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <StarIcon sx={{ mr: 0.5, fontSize: "1.2rem" }} />
                        <Typography variant="h4" fontWeight="bold">
                          {staffStats.customerRating}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Đánh giá
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>

            {/* Experience Card */}
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                border: "1px solid #e1e5e9",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Thông tin công việc
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <AssignmentIcon sx={{ color: "#2b6f56", mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Kinh nghiệm
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {staffStats.experienceMonths} tháng
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Trạng thái
                    </Typography>
                    <Chip
                      label="Sẵn sàng nhận task"
                      color="success"
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Chuyên môn
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      <Chip label="Tư vấn tour" size="small" variant="outlined" />
                      <Chip label="Lặn thám hiểm" size="small" variant="outlined" />
                      <Chip label="Hướng dẫn cave" size="small" variant="outlined" />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#2b6f56",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Chỉnh sửa hồ sơ
          <IconButton
            onClick={handleCloseEditDialog}
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Họ và tên"
                value={editForm.fullName}
                onChange={handleFormChange("fullName")}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editForm.email}
                onChange={handleFormChange("email")}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={editForm.phone}
                onChange={handleFormChange("phone")}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseEditDialog} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            sx={{
              bgcolor: "#2b6f56",
              "&:hover": {
                bgcolor: "#1e5a44",
              },
            }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StaffProfile;