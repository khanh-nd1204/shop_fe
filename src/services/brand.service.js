import axios from "../utils/axios.customize.js";

const getBrandsAPI = (query) => {
    const URL_BACKEND = `/api/v1/brands${query}`;
    return axios.get(URL_BACKEND);
}

const getAllBrandAPI = () => {
    const URL_BACKEND = '/api/v1/brands/all';
    return axios.get(URL_BACKEND);
}

const createBrandAPI = (data) => {
    const URL_BACKEND = '/api/v1/brands';
    return axios.post(URL_BACKEND, data);
}

const updateBrandAPI = (data) => {
    const URL_BACKEND = '/api/v1/brands';
    return axios.patch(URL_BACKEND, data);
}

const deleteBrandAPI = (id) => {
    const URL_BACKEND = `/api/v1/brands/${id}`;
    return axios.delete(URL_BACKEND);
}

export {getBrandsAPI, createBrandAPI, updateBrandAPI, deleteBrandAPI, getAllBrandAPI};