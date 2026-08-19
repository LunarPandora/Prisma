import { api } from "../utils/api"

export const fetchPenelitiDetail = async () => {
  const res = await api.get("/peneliti-detail")
  return res.data.data
}

export const updatePenelitiDetail = (formData) => {
  return api.post("/peneliti-detail/update", formData)
}