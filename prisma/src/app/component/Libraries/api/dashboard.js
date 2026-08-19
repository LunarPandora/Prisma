import { api } from "../utils/api"

export const getSuperadminDashboard = () => {
  return api.get('/dashboard/superadmin')
}

export const getStaffDashboard = () => {
  return api.get('/dashboard/staff')
}

export const getKetuaDashboard = () => {
  return api.get('/dashboard/ketua')
}

export const getDosenDashboard = () => {
  return api.get('/dashboard/dosen')
}

export const getReviewerDashboard = () => {
  return api.get('/dashboard/reviewer')
}
