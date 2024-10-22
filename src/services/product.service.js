import axios from "../utils/axios.customize.js";

const getProductsAPI = (query) => {
    const URL_BACKEND = `/api/v1/phones${query}`;
    return axios.get(URL_BACKEND);
}

const getProductNamesAPI = () => {
    const URL_BACKEND = '/api/v1/phones/name';
    return axios.get(URL_BACKEND);
}

const getProductAPI = (id) => {
    const URL_BACKEND = `/api/v1/phones/${id}`;
    return axios.get(URL_BACKEND);
}

const createProductAPI = (data) => {
    const URL_BACKEND = '/api/v1/phones';
    return axios.post(URL_BACKEND, data);
}

const updateProductAPI = (data) => {
    const URL_BACKEND = '/api/v1/phones';
    return axios.patch(URL_BACKEND, data);
}

const deleteProductAPI = (id) => {
    const URL_BACKEND = `/api/v1/phones/${id}`;
    return axios.delete(URL_BACKEND);
}

export {getProductsAPI, createProductAPI, updateProductAPI, deleteProductAPI, getProductAPI, getProductNamesAPI};