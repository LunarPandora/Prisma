import axios from "axios"
import { useUserStore } from "@/app/stores/useUserStore";
import { useLoaderStore } from "@/app/stores/useLoaderStore";

export const web = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
})

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL + '/api',
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
})
  
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(";").shift()
}

web.interceptors.request.use(config => {
  const token = getCookie("XSRF-TOKEN")

  if (token) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token)
  }

  return config
})

api.interceptors.request.use(config => {
  const token = getCookie("XSRF-TOKEN")

  if (token) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token)
  }

  return config
})

let isHandlingAuth = false;

const handleAuthError = (error) => {
  const status = error.response?.status;

  if ((status === 401 || status === 419) && !isHandlingAuth) {
    isHandlingAuth = true;

    // Reset after 2 seconds to allow future auth error handling
    setTimeout(() => {
      isHandlingAuth = false;
    }, 2000);

    // 🔥 start loader
    useLoaderStore.getState().start();

    // 🔥 clear user (this triggers DashboardLayout redirect)
    useUserStore.getState().expiredSession();
  }

  return Promise.reject(error);
};

web.interceptors.response.use(
  (res) => res,
  handleAuthError
);

api.interceptors.response.use(
  (res) => res,
  handleAuthError
);

export async function initAuth() {
  await web.get("/sanctum/csrf-cookie")
}