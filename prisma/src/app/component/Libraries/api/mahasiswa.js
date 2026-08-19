import { api } from "../utils/api"

export const fetchMahasiswa = () => {
  return api.get("/mahasiswa/fetch")
}

export const fetchListMahasiswa = async () => {
  const res = await api.get('/mahasiswa/fetch')
  return res.data.data
}

export const addMahasiswa = (formData) => {
  return api.post("/mahasiswa/add", formData)
}

export const updateMahasiswa = (formData) => {
  return api.post("/mahasiswa/update", formData)
}

export const deleteMahasiswa = (id) => {
  return api.delete(`/mahasiswa/delete/${id}`)
}