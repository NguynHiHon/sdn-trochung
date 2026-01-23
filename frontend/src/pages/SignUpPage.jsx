import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { signUpUser } from '../services/authService'
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

const SignUpPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { register: registerState } = useSelector((state) => state.auth)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Mật khẩu không khớp' })
      return
    }
    try {
      await signUpUser({ username: data.username, password: data.password }, dispatch, navigate)
    } catch (e) {
      console.error('Sign up error:', e)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Đăng ký
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tạo tài khoản mới
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
              <TextField
                label="Confirm password"
                type="password"
                fullWidth
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword?.message}
                {...register('confirmPassword', { required: 'Vui lòng xác nhận mật khẩu' })}
              />

              {registerState.error && <Alert severity="error">Đăng ký thất bại</Alert>}

              <Button type="submit" variant="contained" disabled={registerState.isFetching}>
                {registerState.isFetching ? 'Đang xử lý...' : 'Đăng ký'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Đã có tài khoản?{' '}
            <Link to="/signin">Đăng nhập</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SignUpPage