import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: "auth",
    initialState: {
        currentUser: null,
        isAuthenticated: false,
        isFetching: false,
        error: false,
        register: {
            isFetching: false,
            error: false,
            success: false,
        },
    },
    reducers: {
        // Login actions
        loginStart: (state) => {
            state.isFetching = true;
            state.error = false;
        },
        loginSuccess: (state, action) => {
            state.isFetching = false;
            state.currentUser = action.payload.user;
            state.isAuthenticated = true;
            state.error = false;
        },
        loginFailure: (state) => {
            state.isFetching = false;
            state.error = true;
            state.currentUser = null;
            state.isAuthenticated = false;
        },

        // Register actions
        registerStart: (state) => {
            state.register.isFetching = true;
            state.register.error = false;
        },
        registerSuccess: (state) => {
            state.register.isFetching = false;
            state.register.success = true;
            state.register.error = false;
        },
        registerFailure: (state) => {
            state.register.isFetching = false;
            state.register.error = true;
            state.register.success = false;
        },

        // Logout action
        logout: (state) => {
            state.currentUser = null;
            state.isAuthenticated = false;
            state.isFetching = false;
            state.error = false;
            state.register.isFetching = false;
            state.register.error = false;
            state.register.success = false;
        },

        // Clear all auth state
        clearAuth: (state) => {
            state.currentUser = null;
            state.isAuthenticated = false;
            state.isFetching = false;
            state.error = false;
            state.register.isFetching = false;
            state.register.error = false;
            state.register.success = false;
        },

        // Update user info
        updateUserInfo: (state, action) => {
            if (state.currentUser) {
                state.currentUser = {
                    ...state.currentUser,
                    ...action.payload,
                };
            }
        },

        // Set user (for verification, restore session, etc.)
        setUser: (state, action) => {
            state.currentUser = action.payload.select('-accessToken');
            state.isAuthenticated = !!action.payload;
            state.isFetching = false;
            state.error = false;
        },
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    registerStart,
    registerSuccess,
    registerFailure,
    logout,
    clearAuth,
    updateUserInfo,
    setUser,
} = authSlice.actions;

export default authSlice.reducer;
