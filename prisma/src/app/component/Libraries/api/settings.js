import { api } from "../utils/api"

export const fetchSettings = async () => {
  const res = await api.get('/settings')
  return res.data.data
}

export const updateSettings = (formData) => {
  return api.post("/settings/update", formData)
}

export const updateRektor = (data) => {
  return api.post("/settings/update-rektor", data)
}

export const updateIgnoreKegiatanDates = (data) => {
  return api.post("/settings/update-ignore-kegiatan-dates", data)
}

export const fetchLPPM = async () => {
  const res = await api.get('/settings/fetch-lppm')
  return res.data.data
}

export const fetchKetuaLppm = async () => {
  const res = await api.get('/settings/fetch-ketua-lppm')
  return res.data.data
}

export const fetchRektorat = async () => {
  const res = await api.get('/settings/fetch-rektorat')
  return res.data.data
}
