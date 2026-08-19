import { api } from "../utils/api"

export const addLogbook = (formData) => {
  return api.post("/logbook_pengerjaan", formData)
}

export const updateLogbook = (id, formData) => {
  return api.put(`/logbook_pengerjaan/${id}`, formData)
}

export const deleteLogbook = (id) => {
  return api.delete(`/logbook_pengerjaan/${id}`)
}

export const getLogbook = (page = 1, params = {}) => {
  const query = new URLSearchParams({
    page,
    ...params,
  }).toString()

  return api.get(`/logbook_pengerjaan?${query}`)
}

export const fetchLogbook = async (id) => {
  const res = await api.get(`/logbook_pengerjaan/${id}`)
  return res.data
}

export const fetchAllLogbook = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  const res = await api.get(`/logbook_pengerjaan?${query}`)
  return res.data
}

export const getLogbookDocuments = (id) => {
  return api.get(`/logbook_pengerjaan/${id}/documents`)
}

export const getLaporanDocuments = (id) => {
  return api.get(`/laporan/${id}/documents`)
}

export const replaceDocument = (formData) => {
  return api.post("/logbook_pengerjaan/replace-document", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}