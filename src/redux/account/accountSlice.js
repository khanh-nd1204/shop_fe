import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: {}
};

export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        doLoginAccountAction: (state, action) => {
            state.user = action.payload.user;
            localStorage.setItem("access_token", action.payload.access_token);
        },
        doGetAccountAction: (state, action) => {
            state.user = action.payload;
        },
        doLogoutAccountAction: (state, action) => {
            state.user = {};
            localStorage.removeItem("access_token");
        },
        doUpdateAccountAction: (state, action) => {
            state.user.name = action.payload.name;
            state.user.avatar = action.payload.avatar;
            state.user.phone = action.payload.phone;
            state.user.address = action.payload.address;
            localStorage.removeItem("access_token");
        },
    },

    extraReducers: (builder) => {
    },
});

export const { doGetAccountAction, doLogoutAccountAction,
    doLoginAccountAction, doUpdateAccountAction } = accountSlice.actions;

export default accountSlice.reducer;
