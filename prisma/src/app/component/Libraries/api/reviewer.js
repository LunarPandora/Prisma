import { api } from "../utils/api"

export const fetchReviewer = async () => {
  const res = await api.get('/reviewer')
  return res.data.data
}