import axios from "axios";

const API_BASE_URL = "http://localhost:3001/airtribe/capstone/chronos/app/api/v1";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

export default api;