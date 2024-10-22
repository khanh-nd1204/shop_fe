import axios from "../utils/axios.customize.js";

const uploadSingleImageAPI = (file, folder) => {
    const URL_BACKEND = "/api/v1/files/single";
    let config = {
        headers: {
            "folder_type": folder,
            "Content-Type": "multipart/form-data"
        }
    }
    const data = new FormData();
    data.append("file", file);
    return axios.post(URL_BACKEND, data, config);
}

const uploadMultipleImageAPI = (files, folder) => {
    const URL_BACKEND = "/api/v1/files/multiple";
    let config = {
        headers: {
            "folder_type": folder,
            "Content-Type": "multipart/form-data"
        }
    }
    const data = new FormData();
    data.append("files", files);
    return axios.post(URL_BACKEND, data, config);
}

export {uploadSingleImageAPI, uploadMultipleImageAPI};