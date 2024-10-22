import axios from "../utils/axios.customize.js";

const getDashboardAPI = () => {
    const URL_BACKEND = "/api/v1/dashboard";
    return axios.get(URL_BACKEND);
}

export {getDashboardAPI}