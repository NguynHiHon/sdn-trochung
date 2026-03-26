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
import { clearUserProfile } from '../redux/slices/userSlice';
import { persistor } from '../redux/store';

const clearBrowserAuthData = () => {
    try {
        localStorage.clear();
        sessionStorage.clear();
    } catch (_) {
        // ignore storage cleanup errors
    }

    // Try clearing common cookies used for auth/session in browser scope.
    const cookieNames = ['refreshToken', 'accessToken', 'token', 'jwt', 'connect.sid'];
    cookieNames.forEach((name) => {
        document.cookie = `${name}=; Max-Age=0; path=/;`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname};`;
    });
};

export const forceClientLogout = async (dispatch, navigate, redirectTo = '/signin', fromPath = '') => {
    try {
        await axiosPublic.post('/api/auth/signOut');
    } catch (error) {
        // ignore signOut API failures and continue hard cleanup
        console.error('Force signOut API failed:', error?.message || error);
    }

    dispatch(logout());
    dispatch(clearToken());
    dispatch(clearUserProfile());

    try {
        await persistor.purge();
    } catch (_) {
        // ignore persist cleanup errors
    }

    clearBrowserAuthData();
    navigate(redirectTo, { replace: true, state: fromPath ? { from: fromPath } : undefined });
};

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
    await forceClientLogout(dispatch, navigate, '/');
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
        dispatch(clearUserProfile());
        throw error;
    }
};




