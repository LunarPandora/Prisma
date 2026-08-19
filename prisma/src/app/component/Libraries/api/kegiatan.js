import { api } from "../utils/api"

export const updateKegiatan = (formData) => {
  return api.post("/kegiatan/update", formData)
}

export const getKegiatan = (query = "") => {
  return api.get(`/kegiatan?${query}`)
}

export const fetchKegiatan = async () => {
  const res = await api.get('/kegiatan/fetch')
  return res.data
}

export const fetchAllKegiatan = async () => {
  const res = await api.get('/kegiatan/fetch/all')
  return res.data
}

export const fetchPenerimaanProposal = async () => {
    const res = await api.get('/kegiatan/fetch-penerimaan-proposal')
    return res.data
}
