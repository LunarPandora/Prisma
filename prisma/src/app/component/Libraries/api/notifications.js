import { api } from "../utils/api"

export const getNotifications = (query = '') => {
  return api.get(`/notifications?${query}`)
}

export const getUnreadCount = () => {
  return api.get('/notifications/unread-count')
}

export const markAsRead = (id) => {
  return api.put(`/notifications/${id}/read`)
}

export const markAllAsRead = () => {
  return api.put('/notifications/read-all')
}

export const deleteNotification = (id) => {
  return api.delete(`/notifications/${id}`)
}
