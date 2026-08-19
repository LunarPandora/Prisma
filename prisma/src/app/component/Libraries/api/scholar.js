import { api } from "../utils/api"

export const getScholarDashboard = () => {
    return api.get("/scholar/dashboard")
}

export const connectScholarProfile = (formData) => {
    return api.post("/scholar/connect", formData)
}

export const syncScholarProfile = () => {
    return api.post("/scholar/sync")
}

export const getScholarPublications = (query = "") => {
    return api.get(`/scholar/publications?${query}`)
}

export const getPublicationCitationHistory = (publicationId) => {
    return api.get(`/scholar/publications/${publicationId}/citation-history`)
}
