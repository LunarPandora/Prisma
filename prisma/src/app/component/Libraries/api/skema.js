import { api } from "../utils/api"

export const addSkema = (formData) => {
    return api.post("/skema/add", formData)
}

export const updateSkema = (formData) => {
    return api.post("/skema/update", formData)
}

export const deleteSkema = (formData) => {
    return api.post("/skema/delete", formData)
}

export const getSkema = (query = '') => {
    return api.get(`/skema?${query}`)
}

export const fetchSkema = async () => {
    const res = await api.get('/skema/fetch')
    return res.data
}

export const fetchAllSkema = async () => {
    const res = await api.get('/skema/fetch/all')
    return res.data
}

export const getStaffMonitoringSkema = () => {
    return api.get('/skema/staff-monitoring')
}