import { api } from "../utils/api"

export const getDiseminasi = (query = '') => {
  return api.get(`/diseminasi?${query}`)
}

export const approveDiseminasi = (formData) => {
  return api.post("/diseminasi/approve", formData)
}

export const staffDecideDiseminasi = (formData) => {
  return api.post("/diseminasi/staff-decide", formData)
}

export const authorizeDiseminasiRejection = (authorizationRequestId, action, reason = "") => {
  return api.post("/authorization-request/authorize", {
    authorization_request_id: authorizationRequestId,
    action,
    review_note: reason,
  })
}

export const finalDecisionDiseminasi = (formData) => {
  return api.post("/diseminasi/final-decision", formData)
}
