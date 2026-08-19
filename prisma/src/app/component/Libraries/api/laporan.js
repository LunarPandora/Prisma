import { api } from "../utils/api"

export const getLaporan = (query = '') => {
  return api.get(`/laporan?${query}`)
}

export const updateLaporan = (formData) => {
  return api.post("/laporan/update", formData)
}

export const uploadDokumenLaporan = (formData) => {
  return api.post("/laporan/upload-dokumen", formData)
}

export const finishLaporan = (formData) => {
  return api.post("/laporan/finish", formData)
}

export const generateLaporanAkhir = (formData) => {
  return api.post("/laporan/generate-laporan-akhir", formData)
}

export const submitPublikasi = (formData) => {
  return api.post("/laporan/publikasi", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export const adminDecideLaporan = (formData) => {
  return api.post("/laporan/decide", formData)
}

/*
|--------------------------------------------------------------------------
| Laporan Members (independent from Proposal members)
|--------------------------------------------------------------------------
*/

export const getLaporanMembers = (laporanId) => {
  return api.get(`/laporan/${laporanId}/members`)
}

export const addLaporanMember = (formData) => {
  return api.post("/laporan/members", formData)
}

export const updateLaporanMember = (id, formData) => {
  return api.put(`/laporan/members/${id}`, formData)
}

export const removeLaporanMember = (id) => {
  return api.delete(`/laporan/members/${id}`)
}

export const reorderLaporanMembers = (formData) => {
  return api.post("/laporan/members/reorder", formData)
}

export const seedLaporanMembers = (laporanId) => {
  return api.post(`/laporan/${laporanId}/members/seed`)
}

/*
|--------------------------------------------------------------------------
| Realisasi Anggaran (Point F budget items)
|--------------------------------------------------------------------------
*/

export const getRealisasiAnggaran = (laporanId) => {
  return api.get(`/laporan/${laporanId}/realisasi-anggaran`)
}

export const createRealisasiAnggaran = (formData) => {
  return api.post("/laporan/realisasi-anggaran", formData)
}

export const updateRealisasiAnggaran = (id, formData) => {
  return api.put(`/laporan/realisasi-anggaran/${id}`, formData)
}

export const deleteRealisasiAnggaran = (id) => {
  return api.delete(`/laporan/realisasi-anggaran/${id}`)
}
