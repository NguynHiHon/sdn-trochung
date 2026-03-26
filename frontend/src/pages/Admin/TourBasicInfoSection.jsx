import React from 'react';
import {
    Typography,
    TextField,
    MenuItem,
    Switch,
    FormControlLabel,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';

const TourBasicInfoSection = React.memo(function TourBasicInfoSection({
    lang,
    basicForm,
    errors,
    caves,
    onBilingualChange,
    onFieldChange,
    onClearError,
}) {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label={`Tên Tour (${lang === 'vi' ? 'VI' : 'EN'})`}
                    value={basicForm.name?.[lang] || ''}
                    error={!!errors[`name.${lang}`]}
                    helperText={errors[`name.${lang}`] || ''}
                    onChange={(e) => onBilingualChange('name', lang, e.target.value)}
                    sx={{ mb: 2 }}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label={`Mô tả ngắn (${lang === 'vi' ? 'VI' : 'EN'})`}
                    value={basicForm.description?.[lang] || ''}
                    error={!!errors[`description.${lang}`]}
                    helperText={errors[`description.${lang}`] || ''}
                    onChange={(e) => onBilingualChange('description', lang, e.target.value)}
                    sx={{ mb: 2 }}
                />
            </Grid>

            <Grid item xs={3}>
                <TextField
                    fullWidth
                    size="small"
                    label="Mã tour"
                    required
                    value={basicForm.code}
                    error={!!errors.code}
                    helperText={errors.code || ''}
                    onChange={(e) => {
                        onFieldChange('code', e.target.value);
                        onClearError('code');
                    }}
                />
            </Grid>

            <Grid item xs={3}>
                <TextField
                    fullWidth
                    size="small"
                    label="Slug (URL)"
                    required
                    value={basicForm.slug}
                    error={!!errors.slug}
                    helperText={errors.slug || ''}
                    onChange={(e) => {
                        onFieldChange('slug', e.target.value);
                        onClearError('slug');
                    }}
                />
            </Grid>

            <Grid item xs={3}>
                <TextField
                    fullWidth
                    size="small"
                    label="Giá (VNĐ)"
                    type="number"
                    required
                    value={basicForm.priceVND}
                    error={!!errors.priceVND}
                    helperText={errors.priceVND || ''}
                    onChange={(e) => {
                        onFieldChange('priceVND', e.target.value);
                        onClearError('priceVND');
                    }}
                />
            </Grid>

            <Grid item xs={3}>
                <TextField
                    fullWidth
                    size="small"
                    label="Giá (USD)"
                    type="number"
                    value={basicForm.priceUSD}
                    onChange={(e) => onFieldChange('priceUSD', e.target.value)}
                />
            </Grid>

            <Grid item xs={2}>
                <TextField
                    fullWidth
                    size="small"
                    label="Số ngày"
                    type="number"
                    required
                    value={basicForm.durationDays}
                    error={!!errors.durationDays}
                    helperText={errors.durationDays || ''}
                    onChange={(e) => {
                        onFieldChange('durationDays', e.target.value);
                        onClearError('durationDays');
                    }}
                />
            </Grid>

            <Grid item xs={2}>
                <TextField
                    fullWidth
                    size="small"
                    select
                    label="Độ khó (1-6)"
                    value={basicForm.adventureLevel}
                    error={!!errors.adventureLevel}
                    helperText={errors.adventureLevel || ''}
                    onChange={(e) => {
                        onFieldChange('adventureLevel', e.target.value);
                        onClearError('adventureLevel');
                    }}
                >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <MenuItem key={n} value={n}>
                            Level {n}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>

            <Grid item xs={2}>
                <TextField
                    fullWidth
                    size="small"
                    label="Người/Tour"
                    type="number"
                    value={basicForm.groupSize}
                    onChange={(e) => onFieldChange('groupSize', e.target.value)}
                />
            </Grid>

            <Grid item xs={2}>
                <TextField
                    fullWidth
                    size="small"
                    label="Tuổi Min"
                    type="number"
                    value={basicForm.ageMin}
                    onChange={(e) => onFieldChange('ageMin', e.target.value)}
                />
            </Grid>

            <Grid item xs={2}>
                <TextField
                    fullWidth
                    size="small"
                    label="Tuổi Max"
                    type="number"
                    value={basicForm.ageMax}
                    onChange={(e) => onFieldChange('ageMax', e.target.value)}
                />
            </Grid>

            <Grid item xs={2}>
                <TextField
                    fullWidth
                    size="small"
                    select
                    label="Loại Tour"
                    value={basicForm.tourType}
                    error={!!errors.tourType}
                    helperText={errors.tourType || ''}
                    onChange={(e) => {
                        onFieldChange('tourType', e.target.value);
                        onClearError('tourType');
                    }}
                >
                    <MenuItem value="multiday">Tour dài ngày</MenuItem>
                    <MenuItem value="overnight">Tour qua đêm</MenuItem>
                    <MenuItem value="daytour">Tour trong ngày</MenuItem>
                    <MenuItem value="family">Tour gia đình</MenuItem>
                </TextField>
            </Grid>

            <Grid item xs={4}>
                <TextField
                    fullWidth
                    size="small"
                    select
                    label="Hang động Trọng tâm"
                    value={basicForm.caveId}
                    onChange={(e) => onFieldChange('caveId', e.target.value)}
                >
                    <MenuItem value="">-- Không chọn --</MenuItem>
                    {caves.map((c) => (
                        <MenuItem key={c._id} value={c._id}>
                            {c.name?.vi || c.code}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>

            <Grid item xs={3}>
                <TextField
                    fullWidth
                    size="small"
                    select
                    label="Trạng thái"
                    value={basicForm.status}
                    error={!!errors.status}
                    helperText={errors.status || ''}
                    onChange={(e) => {
                        onFieldChange('status', e.target.value);
                        onClearError('status');
                    }}
                >
                    <MenuItem value="draft">Nháp</MenuItem>
                    <MenuItem value="published">Xuất bản</MenuItem>
                    <MenuItem value="archived">Lưu trữ</MenuItem>
                </TextField>
            </Grid>

            <Grid item xs={3}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={basicForm.isFeatured}
                            onChange={(e) => onFieldChange('isFeatured', e.target.checked)}
                        />
                    }
                    label="Đánh dấu Nổi Bật"
                />
            </Grid>
        </Grid>
    );
});

export default TourBasicInfoSection;
