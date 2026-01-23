import React from 'react'
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
} from '@mui/material'

const SignInPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isFetching, error } = useSelector((state) => state.auth)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      await signInUser(data, dispatch, navigate)
    } catch (e) {
      console.error('Sign in error:', e)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Đăng nhập
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng nhập thông tin để tiếp tục
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
            <Stack spacing={2}>
              <TextField
                label="Username"
                type="text"
                fullWidth
                error={Boolean(errors.username)}
                helperText={errors.username?.message}
                {...register('username', { required: 'Username là bắt buộc' })}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                {...register('password', { required: 'Password là bắt buộc' })}
              />

              {error && <Alert severity="error">Đăng nhập thất bại</Alert>}

              <Button type="submit" variant="contained" disabled={isFetching}>
                {isFetching ? 'Đang xử lý...' : 'Đăng nhập'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Chưa có tài khoản?{' '}
            <Link to="/signup">Đăng ký</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SignInPage