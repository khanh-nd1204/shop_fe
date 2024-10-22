import axios from "axios";

const getCountriesAPI = () => {
    const URL_BACKEND = "https://countriesnow.space/api/v0.1/countries/positions";
    return axios.get(URL_BACKEND);
}

const getProvincesAPI = () => {
    const URL_BACKEND = "https://provinces.open-api.vn/api/?depth=3";
    return axios.get(URL_BACKEND);
}

export {getCountriesAPI, getProvincesAPI}