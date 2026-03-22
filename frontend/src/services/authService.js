import { axiosPublic } from '../config/axiosPublic';
import {
    loginStart,
    loginSuccess,
    loginFailure,
    registerStart,
    registerSuccess,
    registerFailure,
    logout
} from '../redux/slices/authSlice';
import { setAccessToken, clearToken } from '../redux/slices/tokenSlice';

// Sign In
export const signInUser = async (user, dispatch, navigate) => {
    dispatch(loginStart());
    try {
        const res = await axiosPublic.post('/api/auth/signIn', user);

        // Dispatch user info vào authSlice
        const userwithoutToken = { ...res.data.user };
        delete userwithoutToken.accessToken;
        dispatch(loginSuccess({ user: userwithoutToken }));

        // Dispatch accessToken vào tokenSlice
        dispatch(setAccessToken(res.data.user.accessToken));

        // Điều hướng theo role
        if (res.data.user.role === 'admin') {
            navigate("/manager");
        } else if (res.data.user.role === 'staff') {
            navigate("/staff");
        } else {
            navigate("/");
        }

        return res.data;
    } catch (error) {
        dispatch(loginFailure());
        throw error;
    }
};

// Sign Up
export const signUpUser = async (user, dispatch, navigate) => {
    dispatch(registerStart());
    try {
        const res = await axiosPublic.post('/api/auth/signUp', user);
        dispatch(registerSuccess());
        navigate("/signin");
        return res.data;
    } catch (error) {
        dispatch(registerFailure());
        throw error;
    }
};

// Sign Out
export const signOutUser = async (dispatch, navigate) => {
    try {
        await axiosPublic.post('/api/auth/signOut');
        dispatch(logout());
        dispatch(clearToken());
        navigate('/');
    } catch (error) {
        // Ngay cả khi API call thất bại, vẫn logout ở frontend
        console.error("SignOut API call failed:", error);
        dispatch(logout());
        dispatch(clearToken());
        navigate('/');
    }
};

// Refresh Token (nếu cần)
export const refreshAccessToken = async (dispatch) => {
    try {
        const res = await axiosPublic.post('/api/auth/refresh-token');
        dispatch(setAccessToken(res.data.accessToken));
        return res.data.accessToken;
    } catch (error) {
        dispatch(logout());
        dispatch(clearToken());
        throw error;
    }
};




