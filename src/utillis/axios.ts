import axios from "axios"

export const axiosInstance = axios.create({
  baseURL: "https://creatorapi.genesys-staging.kotukodev.it",
  withCredentials: true,
})
