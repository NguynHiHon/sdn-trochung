import axios from 'axios'

const baseURL = 'http://localhost:9999'

export const axiosPublic = axios.create({
    baseURL,
    withCredentials: true,
})