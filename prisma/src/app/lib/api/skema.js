import { api } from "../api"

export const addSkema = (formData) => {
  return api.post("/skema/add", formData)
}

export const updateSkema = (formData) => {
  return api.post("/skema/update", formData)
}

export const deleteSkema = (id) => {
  return api.delete(`/skema/delete/${id}`)
}

export const getSkema = (page = 1) => {
  return api.get(`/skema?page=${page}`)
}

export const fetchSkema = async () => {
  const res = await api.get('/skema/fetch')
  return res.data
}