import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { getAllSchedules } from '../../services/scheduleApi';

const WEEKDAYS_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const WEEKDAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS_VI = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const MONTHS_EN = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AvailabilityCalendar({ tourId, lang = 'vi', onSelectDate }) {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!tourId) return;
        setLoading(true);
        getAllSchedules({ tourId, month, year, limit: 50 })
            .then(res => {
                if (res.success) setSchedules(res.data);
            })
            .catch(() => setSchedules([]))
            .finally(() => setLoading(false));
    }, [tourId, month, year]);

    // Build a Map: dayOfMonth -> schedule data
    const scheduleMap = useMemo(() => {
        const map = {};
        schedules.forEach(s => {
            const d = new Date(s.startDate);
            const dayKey = d.getDate();
            // Only show schedules that are not Cancelled/Completed
            if (s.status === 'Available' || s.status === 'Full') {
                if (!map[dayKey]) map[dayKey] = [];
                map[dayKey].push({
                    remaining: s.capacity - s.bookedSlots,
                    capacity: s.capacity,
                    status: s.status,
                    id: s._id,
                    startDate: s.startDate,
                });
            }
        });
        return map;
    }, [schedules]);

    // Calendar grid logic
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Mon=0

    const prevMonth = () => {
        if (month === 1) { setMonth(12); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 12) { setMonth(1); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const today = now.getDate();
    const isCurrentMonth = now.getMonth() + 1 === month && now.getFullYear() === year;
    const weekdays = lang === 'vi' ? WEEKDAYS_VI : WEEKDAYS_EN;
    const monthLabel = lang === 'vi' ? MONTHS_VI[month] : MONTHS_EN[month];

    // Build cells: offset blanks + day cells
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push({ blank: true });
    for (let d = 1; d <= daysInMonth; d++) {
        const isPast = isCurrentMonth && d < today;
        const info = scheduleMap[d];
        cells.push({ day: d, isPast, info });
    }

    return (
        <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid #e2ddd3', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                bgcolor: '#2b6f56', px: 2.5, py: 1.5
            }}>
                <IconButton onClick={prevMonth} size="small" sx={{ color: '#fff' }}><ChevronLeftIcon /></IconButton>
                <Typography fontWeight={700} color="white" fontSize="1rem">
                    {monthLabel} {year}
                </Typography>
                <IconButton onClick={nextMonth} size="small" sx={{ color: '#fff' }}><ChevronRightIcon /></IconButton>
            </Box>

            {/* Weekday headers */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', bgcolor: '#f5f2ec' }}>
                {weekdays.map(w => (
                    <Box key={w} sx={{ py: 1, textAlign: 'center' }}>
                        <Typography fontSize="0.72rem" fontWeight={700} color="#888" textTransform="uppercase">{w}</Typography>
                    </Box>
                ))}
            </Box>

            {/* Day grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', bgcolor: '#eee8de', p: '1px' }}>
                {cells.map((cell, idx) => {
                    if (cell.blank) return <Box key={`b-${idx}`} sx={{ bgcolor: '#faf8f4', minHeight: 64 }} />;

                    const hasSchedule = !!cell.info;
                    const allFull = hasSchedule && cell.info.every(s => s.status === 'Full');
                    const totalRemaining = hasSchedule ? cell.info.reduce((sum, s) => sum + s.remaining, 0) : 0;

                    let bgColor = '#fff';
                    let cursor = 'default';
                    if (cell.isPast) bgColor = '#f9f7f3';
                    else if (hasSchedule && !allFull) { bgColor = '#edf8f2'; cursor = 'pointer'; }
                    else if (allFull) bgColor = '#fef3f0';

                    return (
                        <Box
                            key={cell.day}
                            onClick={() => {
                                if (hasSchedule && !allFull && !cell.isPast && onSelectDate) {
                                    onSelectDate(cell.info[0]);
                                }
                            }}
                            sx={{
                                bgcolor: bgColor, minHeight: 64, p: 0.8,
                                display: 'flex', flexDirection: 'column', cursor,
                                transition: 'all .2s',
                                position: 'relative',
                                ...(hasSchedule && !allFull && !cell.isPast ? {
                                    '&:hover': { bgcolor: '#d6f0e2', transform: 'scale(1.04)', zIndex: 2, boxShadow: '0 2px 8px rgba(43,111,86,0.2)' }
                                } : {}),
                                ...(isCurrentMonth && cell.day === today ? { border: '2px solid #2b6f56', borderRadius: 1 } : {})
                            }}
                        >
                            <Typography fontSize="0.82rem" fontWeight={isCurrentMonth && cell.day === today ? 800 : 500}
                                color={cell.isPast ? '#ccc' : '#333'}>
                                {cell.day}
                            </Typography>

                            {hasSchedule && !cell.isPast && (
                                <Box sx={{ mt: 'auto' }}>
                                    {allFull ? (
                                        <Typography fontSize="0.62rem" fontWeight={700} color="#e74c3c" textAlign="center">
                                            {lang === 'vi' ? 'HẾT CHỖ' : 'FULL'}
                                        </Typography>
                                    ) : (
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography fontSize="0.62rem" fontWeight={700} color="#2b6f56">
                                                {totalRemaining} {lang === 'vi' ? 'chỗ' : 'slots'}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>

            {/* Legend */}
            <Box sx={{ display: 'flex', gap: 2.5, px: 2.5, py: 1.5, bgcolor: '#faf8f4', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#edf8f2', border: '1px solid #c8ddd1' }} />
                    <Typography fontSize="0.72rem" color="#666">{lang === 'vi' ? 'Còn trống' : 'Available'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#fef3f0', border: '1px solid #f5c6b8' }} />
                    <Typography fontSize="0.72rem" color="#666">{lang === 'vi' ? 'Hết chỗ' : 'Full'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '3px', border: '2px solid #2b6f56' }} />
                    <Typography fontSize="0.72rem" color="#666">{lang === 'vi' ? 'Hôm nay' : 'Today'}</Typography>
                </Box>
            </Box>
        </Box>
    );
}
