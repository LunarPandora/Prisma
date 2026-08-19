import { api } from "../utils/api"

export const createAuthorizationRequest = (formData) => {
  return api.post("/authorization-request", formData)
}

export const authorizeRequest = (authorizationRequestId, action, reason = "") => {
  return api.post("/authorization-request/authorize", {
    authorization_request_id: authorizationRequestId,
    action,
    review_note: reason,
  })
}

export const getAuthorizationRequests = (query = '') => {
  return api.get(`/authorization-request?${query}`)
}
