import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: "user",
    initialState: {
        profile: null,
        isFetching: false,
        error: false,
    },
    reducers: {
        // Get user profile actions
        getUserProfileStart: (state) => {
            state.isFetching = true;
            state.error = false;
        },
        getUserProfileSuccess: (state, action) => {
            state.isFetching = false;
            state.profile = action.payload;
            state.error = false;
        },
        getUserProfileFailure: (state) => {
            state.isFetching = false;
            state.error = true;
        },

        // Clear user profile (khi logout)
        clearUserProfile: (state) => {
            state.profile = null;
            state.isFetching = false;
            state.error = false;
        },

        // Update user profile
        updateUserProfile: (state, action) => {
            if (state.profile) {
                state.profile = {
                    ...state.profile,
                    ...action.payload,
                };
            }
        },
    },
});

export const {
    getUserProfileStart,
    getUserProfileSuccess,
    getUserProfileFailure,
    clearUserProfile,
    updateUserProfile,
} = userSlice.actions;

export default userSlice.reducer;
