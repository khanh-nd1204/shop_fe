import axios from "../utils/axios.customize.js";

const getUsersAPI = (query) => {
    const URL_BACKEND = `/api/v1/users${query}`;
    return axios.get(URL_BACKEND);
}

const createUserAPI = (data) => {
    const URL_BACKEND = "/api/v1/users";
    return axios.post(URL_BACKEND, data);
}

const createBulkUserAPI = (data) => {
    const URL_BACKEND = "/api/v1/users/bulk";
    return axios.post(URL_BACKEND, data);
}

const updateUserAPI = (data) => {
    const URL_BACKEND = "/api/v1/users";
    return axios.patch(URL_BACKEND, data);
}

const deleteUserAPI = (id) => {
    const URL_BACKEND = `/api/v1/users/${id}`;
    return axios.delete(URL_BACKEND);
}

const activateUserAPI = (id) => {
    const URL_BACKEND = `/api/v1/users/${id}`;
    return axios.post(URL_BACKEND);
}

const changePasswordAPI = (data) => {
    const URL_BACKEND = "/api/v1/users/change-password";
    return axios.post(URL_BACKEND, data);
}

export {getUsersAPI, createUserAPI, createBulkUserAPI, updateUserAPI, deleteUserAPI, changePasswordAPI, activateUserAPI}