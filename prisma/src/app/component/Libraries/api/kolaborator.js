import { api } from "../utils/api"

export const fetchKolaborator = async () => {
  const res = await api.get('/kolaborator/fetch')
  return res.data.data
}

export const fetchListKolaborator = (query = '') => {
  return api.get(`/kolaborator?${query}`)
}

export const addKolaborator = (formData) => {
  return api.post("/kolaborator/add", formData)
}

export const updateKolaborator = (formData) => {
  return api.post("/kolaborator/update", formData)
}

export const deleteKolaborator = (id) => {
  return api.delete(`/kolaborator/delete/${id}`)
}