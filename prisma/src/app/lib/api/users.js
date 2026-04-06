import { api } from "../api"

export const getUserData = () => {
  return api.post("/users/current")
}

export const addUsers = (formData) => {
  return api.post("/users/add", formData)
}

export const updateUsers = (formData) => {
  return api.post("/users/update", formData)
}

export const deleteUsers = (id) => {
  return api.delete(`/users/delete/${id}`)
}

export const getUsers = (page = 1) => {
  return api.get(`/users?page=${page}`)
}
