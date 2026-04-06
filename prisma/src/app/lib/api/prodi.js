import { api } from "../api"

export const addProdi = (formData) => {
  return api.post("/prodi/add", formData)
}

export const updateProdi = (formData) => {
  return api.post("/prodi/update", formData)
}

export const deleteProdi = (id) => {
  return api.post("/prodi/delete", { id })
}

export const getProdi = (page = 1) => {
  return api.get(`/prodi?page=${page}`)
}

export const fetchProdi = async () => {
  const res = await api.get('/prodi/fetch')
  return res.data
}