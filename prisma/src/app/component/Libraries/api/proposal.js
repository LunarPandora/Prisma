import { api } from "../utils/api"

export const addHalamanPengesahan = (formData) => {
  return api.post("/proposal/draft/add", formData)
}

export const updateHalamanPengesahan = (formData) => {
  return api.post("/proposal/draft/update", formData)
}

export const getGeneratedTemplate = (formData) => {
  return api.post("/proposal/upload/prepare", formData)
}

export const uploadProposal = (formData) => {
  return api.post("/proposal/upload/store", formData)
}

export const updateProposal = (formData) => {
  return api.post("/proposal/update", formData)
}

export const deleteProposal = (formData) => {
  return api.post("/proposal/delete", formData)
}

export const getProposal = (query = '') => {
  return api.get(`/proposal?${query}`)
}

export const fetchPengumumanSuratTugas = (query = '') => {
  return api.get(`/proposal/sk/fetch?${query}`)
}

export const generatePengumumanSuratTugas = (formData) => {
  return api.post("/proposal/sk/generate", formData)
}

export const uploadPengumumanSuratTugas = (formData) => {
  return api.post("/proposal/sk/upload", formData)
}

export const acceptProposalSuratTugas = (formData) => {
  return api.post("/proposal/sk/accept", formData)
}

export const ketuaDecideSeleksi = (formData) => {
  return api.post("/proposal/seleksi/ketua-decide", formData)
}

export const staffDecideSeleksi = (formData) => {
  return api.post("/proposal/seleksi/staff-decide", formData)
}

export const authorizeSeleksiRejection = (formData) => {
  return api.post("/authorization-request/authorize", formData)
}
