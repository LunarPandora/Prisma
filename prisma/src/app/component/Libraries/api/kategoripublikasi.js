import { api } from "../utils/api"

export const fetchPublicationCategory = () => {
    return api.get("/publication-category/fetch")
}

export const fetchListPublicationCategory = async () => {
    const res = await api.get("/publication-category/fetch")
    return res.data.data
}

export const addPublicationCategory = (formData) => {
    return api.post("/publication-category/add", formData)
}

export const updatePublicationCategory = (formData) => {
    return api.post("/publication-category/update", formData)
}

export const deletePublicationCategory = (id) => {
    return api.delete(`/publication-category/delete/${id}`)
}