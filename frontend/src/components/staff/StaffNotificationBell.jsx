import React, { useEffect, useRef, useState } from 'react';
import {
    Badge, Box, Button, CircularProgress, Divider, IconButton,
    List, ListItem, ListItemText, Popover, Tooltip, Typography,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { getSocket } from '../../config/socketClient';
import {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from '../../services/notificationApi';

/** Hiển thị thời gian tương đối (vd: "3 phút trước") */
function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return new Date(dateStr).toLocaleDateString('vi-VN');
}

const ICON_BY_TYPE = {
    assignment: <AssignmentIndIcon sx={{ color: '#0288d1', fontSize: 20 }} />,
};

export default function StaffNotificationBell() {
    const currentUser = useSelector((s) => s.auth.currentUser);

    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const [marking, setMarking] = useState(false);

    const fetchRef = useRef(null);

    /* ─── Lấy unreadCount lúc mount ─── */
    useEffect(() => {
        if (!currentUser?._id) return;
        getUnreadCount()
            .then((res) => setUnread(res?.count ?? 0))
            .catch(() => {});
    }, [currentUser?._id]);

    /* ─── Socket listener ─── */
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handler = (payload) => {
            // Chỉ xử lý notification loại assignment (phân công booking)
            if (payload?.type !== 'assignment') return;

            // Thêm vào đầu danh sách (nếu panel đang mở)
            setNotifications((prev) => [{ ...payload, isRead: false }, ...prev]);
            setUnread((prev) => prev + 1);

            toast.info(`🔔 ${payload.title}`, {
                description: payload.content,
                duration: 5000,
            });
        };

        socket.on('newNotification', handler);
        return () => socket.off('newNotification', handler);
    }, []);

    /* ─── Mở panel: tải danh sách thông báo ─── */
    const handleOpen = async (e) => {
        setAnchorEl(e.currentTarget);
        setLoading(true);
        try {
            const res = await getMyNotifications({ page: 1, limit: 20 });
            setNotifications(res?.data || []);
            setUnread(res?.unreadCount ?? 0);
        } catch {
            toast.error('Không tải được thông báo');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => setAnchorEl(null);

    /* ─── Đánh dấu 1 thông báo đã đọc ─── */
    const handleRead = async (notif) => {
        if (notif.isRead) return;
        try {
            await markAsRead(notif._id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
            );
            setUnread((prev) => Math.max(0, prev - 1));
        } catch {
            // bỏ qua lỗi mark-read
        }
    };

    /* ─── Đánh dấu tất cả đã đọc ─── */
    const handleMarkAll = async () => {
        setMarking(true);
        try {
            await markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnread(0);
        } catch {
            toast.error('Không thể đánh dấu tất cả đã đọc');
        } finally {
            setMarking(false);
        }
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <Tooltip title="Thông báo">
                <IconButton onClick={handleOpen} sx={{ color: '#333' }}>
                    <Badge badgeContent={unread > 0 ? unread : null} color="error" max={99}>
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: { width: 380, maxHeight: 520, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        px: 2, py: 1.5,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderBottom: '1px solid #eee',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NotificationsIcon sx={{ color: '#2b6f56', fontSize: 20 }} />
                        <Typography fontWeight={700} fontSize={15}>Thông báo</Typography>
                        {unread > 0 && (
                            <Box
                                sx={{
                                    bgcolor: '#e53935', color: '#fff',
                                    borderRadius: '10px', px: 0.8, py: 0.1,
                                    fontSize: 11, fontWeight: 700, lineHeight: 1.6,
                                }}
                            >
                                {unread}
                            </Box>
                        )}
                    </Box>
                    {unread > 0 && (
                        <Button
                            size="small"
                            startIcon={marking ? <CircularProgress size={12} /> : <DoneAllIcon />}
                            onClick={handleMarkAll}
                            disabled={marking}
                            sx={{ textTransform: 'none', fontSize: 12, color: '#2b6f56' }}
                        >
                            Đọc tất cả
                        </Button>
                    )}
                </Box>

                {/* Body */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={28} sx={{ color: '#2b6f56' }} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ py: 5, textAlign: 'center' }}>
                        <NotificationsIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                        <Typography color="text.secondary" fontSize={14}>
                            Chưa có thông báo nào
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding sx={{ overflowY: 'auto', maxHeight: 420 }}>
                        {notifications.map((notif, idx) => (
                            <React.Fragment key={notif._id}>
                                <ListItem
                                    alignItems="flex-start"
                                    onClick={() => handleRead(notif)}
                                    sx={{
                                        cursor: notif.isRead ? 'default' : 'pointer',
                                        bgcolor: notif.isRead ? 'transparent' : 'rgba(2,136,209,0.05)',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                                        px: 2, py: 1.2, gap: 1.5,
                                    }}
                                >
                                    {/* Icon loại thông báo */}
                                    <Box
                                        sx={{
                                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            bgcolor: notif.isRead ? '#f1f5f9' : 'rgba(2,136,209,0.1)',
                                            mt: 0.3,
                                        }}
                                    >
                                        {ICON_BY_TYPE[notif.type] ?? (
                                            <NotificationsIcon sx={{ fontSize: 18, color: '#888' }} />
                                        )}
                                    </Box>

                                    <ListItemText
                                        primary={
                                            <Typography
                                                fontSize={13}
                                                fontWeight={notif.isRead ? 400 : 700}
                                                color={notif.isRead ? 'text.primary' : '#0d47a1'}
                                                sx={{ lineHeight: 1.4 }}
                                            >
                                                {notif.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography
                                                    component="span"
                                                    fontSize={12}
                                                    color="text.secondary"
                                                    display="block"
                                                    sx={{ mt: 0.3, lineHeight: 1.5 }}
                                                >
                                                    {notif.content}
                                                </Typography>
                                                <Typography
                                                    component="span"
                                                    fontSize={11}
                                                    color="text.disabled"
                                                    display="block"
                                                    sx={{ mt: 0.5 }}
                                                >
                                                    {timeAgo(notif.createdAt)}
                                                </Typography>
                                            </>
                                        }
                                    />

                                    {/* Chấm xanh chưa đọc */}
                                    {!notif.isRead && (
                                        <Box
                                            sx={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                bgcolor: '#0288d1', flexShrink: 0, mt: 1,
                                            }}
                                        />
                                    )}
                                </ListItem>
                                {idx < notifications.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Popover>
        </>
    );
}
