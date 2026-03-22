import { createSlice } from '@reduxjs/toolkit';

const tokenSlice = createSlice({
    name: "token",
    initialState: {
        accessToken: "",
    },
    reducers: {
        // Set access token (khi login hoặc refresh)
        setAccessToken: (state, action) => {
            state.accessToken = action.payload || "";
        },

        // Clear token (khi logout)
        clearToken: (state) => {
            state.accessToken = "";
        },
    },
});

export const {
    setAccessToken,
    clearToken,
} = tokenSlice.actions;

export default tokenSlice.reducer;
