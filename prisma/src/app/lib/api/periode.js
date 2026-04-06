import { api } from "../api"

export const addPeriode = (formData) => {
  return api.post("/periode/add", formData)
}

export const updatePeriode = (formData) => {
  return api.post("/periode/update", formData)
}

export const deletePeriode = (id) => {
  return api.post(`/periode/delete/${id}`)
}

export const getPeriode = (page = 1) => {
  return api.get(`/periode?page=${page}`)
}

