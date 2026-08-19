import { api } from "../utils/api"

export const getDana = (query = '') => {
  return api.get(`/dana?${query}`)
}

export const uploadBuktiTransfer = (formData) => {
  return api.post("/dana/claim/upload-bukti-transfer", formData)
}

export const uploadBuktiTerima = (formData) => {
  return api.post("/dana/claim/upload-bukti-terima", formData)
}

export const confirmClaimDana = (formData) => {
  return api.post("/dana/claim/confirm", formData)
}

export const requestPengembalianDana = (formData) => {
  return api.post("/dana/pengembalian/request", formData)
}

export const uploadPengembalianProof = (formData) => {
  return api.post("/dana/pengembalian/upload-proof", formData)
}

export const confirmPengembalianDana = (formData) => {
  return api.post("/dana/pengembalian/confirm", formData)
}

export const skipPengembalianDana = (formData) => {
  return api.post("/dana/pengembalian/skip", formData)
}

export const getSitasi = (query = '') => {
  return api.get(`/sitasi?${query}`)
}

export const addSitasi = (formData) => {
  return api.post("/sitasi", formData)
}

export const deleteSitasi = (id) => {
  return api.delete(`/sitasi/${id}`)
}
