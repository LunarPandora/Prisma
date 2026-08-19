import { api } from "../utils/api"

// export const addReviewer = (formData) => {
//   return api.post("/reviewer/add", formData)
// }

// export const updateReviewer = (formData) => {
//   return api.post("/reviewer/update", formData)
// }

// export const deleteReviewer = (id) => {
//   return api.post("/reviewer/delete", { id })
// }

export const fetchDosen = async () => {
  const res = await api.get('/dosen')
  return res.data.data
}