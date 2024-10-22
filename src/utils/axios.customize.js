import axios from "axios";
import NProgress from 'nprogress';
import {refreshTokenAPI} from "../services/auth.service.js";

NProgress.configure({
    showSpinner: false,
    trickleSpeed: 100,
});

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true
});

const NO_RETRY_HEADER = 'x-no-retry';

instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    NProgress.start();
    if (typeof window !== "undefined" && window && window.localStorage && window.localStorage.getItem('access_token')) {
        config.headers.Authorization = 'Bearer ' + window.localStorage.getItem('access_token');
    }
    return config;
}, function (error) {
    // Do something with request error
    NProgress.done();
    return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    NProgress.done();
    return response.data && response.data.data ? response.data : response;
}, async function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    NProgress.done();
    if (error.config && error.response && error.response.status === 401 && !error.config.headers[NO_RETRY_HEADER]) {
        const res = await refreshTokenAPI();
        error.config.headers[NO_RETRY_HEADER] = 'true';
        if (res && res.data) {
            window.localStorage.setItem('access_token', res.data.access_token);
            error.config.headers.Authorization = 'Bearer' + res.data.access_token;
            return instance.request(error.config);
        }
    }

    if (error.config && error.response && error.response.status === 403 && error.config.url === '/api/v1/auth/refresh') {
        if (window.location.pathname !== "/" && !window.location.pathname.startsWith("/product") && window.location.pathname !== "/login") {
            window.location.href = '/login';
        }
    }

    return error.response && error.response.data ? error.response.data : error;
});

export default instance;
