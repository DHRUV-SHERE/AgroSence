/**
 * Notifications for the signed-in user (GET /notifications, PUT /notifications/:id/read, DELETE /notifications/:id).
 *
 *   const { items, unread, loading, error, markRead, remove, refetch } = useNotifications()
 *
 * Polls every 60s while the tab is visible. Safe to use in any authenticated component; it is a
 * no-op (empty list) when signed out. Notification shape is read defensively: {id, message, status|read, createdAt}.
 */
import { useCallback, useEffect, useState } from 'react'
import { http } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const isUnread = (n) => (n.status ? n.status === 'unread' : n.read === false)

export function useNotifications({ poll = 60000 } = {}) {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const { data } = await http.get('/notifications', { params: { limit: 20, sort: '-createdAt' } })
      setItems(Array.isArray(data) ? data : data?.items ?? [])
      setError(null)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) { setItems([]); return undefined }
    refetch()
    if (!poll) return undefined
    const id = setInterval(() => { if (document.visibilityState === 'visible') refetch() }, poll)
    return () => clearInterval(id)
  }, [isAuthenticated, poll, refetch])

  const markRead = useCallback(async (id) => {
    setItems((list) => list.map((n) => (n.id === id ? { ...n, status: 'read', read: true } : n)))
    try { await http.put(`/notifications/${id}/read`) } catch { refetch() }
  }, [refetch])

  const remove = useCallback(async (id) => {
    setItems((list) => list.filter((n) => n.id !== id))
    try { await http.delete(`/notifications/${id}`) } catch { refetch() }
  }, [refetch])

  return { items, unread: items.filter(isUnread).length, loading, error, markRead, remove, refetch, isUnread }
}
