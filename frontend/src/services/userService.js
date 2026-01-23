import { axiosJWT } from '../config/axiosJWT';
import {
    getUserProfileStart,
    getUserProfileSuccess,
    getUserProfileFailure
} from '../redux/clices/userSlice';

// Get User Profile (requires accessToken)
export const fetchUserProfile = async (dispatch) => {
    dispatch(getUserProfileStart());
    try {
        const res = await axiosJWT.get('/api/user/me');
        dispatch(getUserProfileSuccess(res.data.userInfo));
        return res.data.userInfo;
    } catch (error) {
        dispatch(getUserProfileFailure());
        throw error;
    }
};

// Update User Profile (if needed later)
export const updateUserProfile = async (userData) => {
    const res = await axiosJWT.put('/api/user/me', userData);
    return res.data;
};
