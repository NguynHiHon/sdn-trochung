import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { signInUser } from '../services/authService'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Alert,
  InputAdornment,
  Avatar,
  Fade,
} from '@mui/material'
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Login as LoginIcon,
} from '@mui/icons-material'

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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }
      }}
    >
      <Fade in timeout={800}>
        <Card
          sx={{
            width: '100%',
            maxWidth: 450,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Logo/Brand Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: '#2b6f56',
                  mb: 2,
                  boxShadow: '0 4px 20px rgba(43,111,86,0.3)',
                }}
              >
                <LoginIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{
                  background: 'linear-gradient(135deg, #2b6f56 0%, #4a9b7e 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                OXALIS
              </Typography>
              <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                Đăng nhập hệ thống
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Vui lòng nhập thông tin để tiếp tục truy cập
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                <TextField
                  label="Tên đăng nhập"
                  type="text"
                  fullWidth
                  variant="outlined"
                  error={Boolean(errors.username)}
                  helperText={errors.username?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#2b6f56' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2b6f56',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2b6f56',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#2b6f56',
                    },
                  }}
                  {...register('username', { required: 'Tên đăng nhập là bắt buộc' })}
                />

                <TextField
                  label="Mật khẩu"
                  type="password"
                  fullWidth
                  variant="outlined"
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#2b6f56' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2b6f56',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2b6f56',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#2b6f56',
                    },
                  }}
                  {...register('password', { required: 'Mật khẩu là bắt buộc' })}
                />

                {(error || submitError) && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {submitError || 'Đăng nhập thất bại'}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isFetching}
                  startIcon={!isFetching && <LoginIcon />}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #2b6f56 0%, #4a9b7e 100%)',
                    boxShadow: '0 6px 20px rgba(43,111,86,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1e5a44 0%, #3a7f66 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 25px rgba(43,111,86,0.4)',
                    },
                    '&:disabled': {
                      background: '#ccc',
                      color: '#777',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isFetching ? 'Đang xử lý...' : 'Đăng nhập'}
                </Button>
              </Stack>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Chưa có tài khoản?{' '}
                <Link
                  to="/signup"
                  style={{
                    color: '#2b6f56',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Đăng ký ngay
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  )
}

export default SignInPage