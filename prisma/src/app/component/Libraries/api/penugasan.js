import { api } from "../utils/api"

export const assignReviewer = (formData) => {
  return api.post("/penugasan/assign", formData)
}

export const confirmAssignment = (formData) => {
  return api.post("/penugasan/confirm-assignment", formData)
}

export const getPenugasan = (page = 1) => {
  return api.get(`/penugasan?page=${page}`)
}