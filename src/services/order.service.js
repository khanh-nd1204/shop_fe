import axios from "../utils/axios.customize.js";

const getOrdersAPI = (query) => {
    const URL_BACKEND = `/api/v1/orders${query}`;
    return axios.get(URL_BACKEND);
}

const getOrderAPI = (id) => {
    const URL_BACKEND = `/api/v1/orders/${id}`;
    return axios.get(URL_BACKEND);
}

const createOrderAPI = (data) => {
    const URL_BACKEND = "/api/v1/orders";
    return axios.post(URL_BACKEND, data);
}

const updateOrderAPI = (data) => {
    const URL_BACKEND = "/api/v1/orders";
    return axios.patch(URL_BACKEND, data);
}

const cancelOrderAPI = (id) => {
    const URL_BACKEND = `/api/v1/orders/${id}`;
    return axios.delete(URL_BACKEND);
}

const getOrdersByUser = (query) => {
    const URL_BACKEND = `/api/v1/orders/user${query}`;
    return axios.post(URL_BACKEND);
}

export {getOrderAPI, getOrdersAPI, createOrderAPI, updateOrderAPI, cancelOrderAPI, getOrdersByUser}