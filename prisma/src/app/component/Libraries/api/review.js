import { api } from "../utils/api"

// export const addHalamanPengesahan = (formData) => {
//   return api.post("/proposal/draft/add", formData)
// }

export const uploadReview = (formData) => {
  return api.post("/review/upload", formData)
}