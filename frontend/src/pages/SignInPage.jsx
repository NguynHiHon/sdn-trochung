import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { signInUser } from '../services/authService'
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
  Stack,
  Alert,
  IconButton,
} from '@mui/material'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined'

const signInErrorText = (code) => {
  const map = {
    USER_NOT_FOUND: 'Không tìm thấy tài khoản.',
    WRONG_PASSWORD: 'Sai mật khẩu.',
    INVALID_INPUT: 'Vui lòng nhập đủ username và mật khẩu.',
  }
  return map[code] || code || 'Đăng nhập thất bại'
}

const SignInPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isFetching, error } = useSelector((state) => state.auth)
  const [submitError, setSubmitError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setSubmitError('')
    try {
      await signInUser(data, dispatch, navigate)
    } catch (e) {
      console.error('Sign in error:', e)
      const status = e.response?.status
      const msg = e.response?.data?.message
      if (status === 404 && msg === 'USER_NOT_FOUND') {
        setSubmitError(signInErrorText('USER_NOT_FOUND'))
      } else if (status === 404 && !msg) {
        setSubmitError(
          'Không gọi được API đăng nhập (404). Kiểm tra backend và route /api/auth/signIn.',
        )
      } else {
        setSubmitError(signInErrorText(msg))
      }
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background image */}
      <Box
        component="img"
        src="/images/hero-bg.jpg"
        alt=""
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* Dark overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(10,46,31,0.75) 100%)',
          zIndex: 1,
        }}
      />

      {/* Glassmorphism card */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 440,
          mx: 2,
          bgcolor: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: 4,
          px: { xs: 3, sm: 5 },
          py: 5,
          boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
        }}
      >
        {/* Logo / brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: '#2b6f56',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(43,111,86,0.5)',
            }}
          >
            <ExploreOutlinedIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              sx={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.1 }}
            >
              Trò Chung
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Cave Explorer
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="h4"
          sx={{ color: 'white', fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em' }}
        >
          Đăng nhập
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 3.5, fontSize: '0.9rem' }}>
          Chào mừng bạn trở lại! Vui lòng nhập thông tin.
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
            <TextField
              label="Tên đăng nhập"
              type="text"
              fullWidth
              error={Boolean(errors.username)}
              helperText={errors.username?.message}
              {...register('username', { required: 'Username là bắt buộc' })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: 'rgba(255,255,255,0.6)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#4ade80' },
                  bgcolor: 'rgba(255,255,255,0.07)',
                  borderRadius: 2,
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.55)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#4ade80' },
                '& .MuiFormHelperText-root': { color: '#f87171' },
              }}
            />

            <TextField
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register('password', { required: 'Password là bắt buộc' })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: 'rgba(255,255,255,0.6)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      sx={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#4ade80' },
                  bgcolor: 'rgba(255,255,255,0.07)',
                  borderRadius: 2,
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.55)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#4ade80' },
                '& .MuiFormHelperText-root': { color: '#f87171' },
              }}
            />

            {(error || submitError) && (
              <Alert
                severity="error"
                sx={{
                  bgcolor: 'rgba(239,68,68,0.15)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,0.3)',
                  '& .MuiAlert-icon': { color: '#fca5a5' },
                }}
              >
                {submitError || 'Đăng nhập thất bại'}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isFetching}
              sx={{
                bgcolor: '#2b6f56',
                color: 'white',
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 20px rgba(43,111,86,0.45)',
                '&:hover': {
                  bgcolor: '#1a5a3e',
                  boxShadow: '0 8px 28px rgba(43,111,86,0.55)',
                },
                '&:disabled': { bgcolor: 'rgba(43,111,86,0.4)', color: 'rgba(255,255,255,0.5)' },
              }}
            >
              {isFetching ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
          </Stack>
        </Box>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 3, color: 'rgba(255,255,255,0.55)' }}
        >
          Chưa có tài khoản?{' '}
          <Link
            to="/signup"
            style={{ color: '#4ade80', fontWeight: 600, textDecoration: 'none' }}
          >
            Đăng ký ngay
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

export default SignInPage