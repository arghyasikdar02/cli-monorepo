import { create } from 'zustand'
import { getUnreadCount } from '../data/notifications'

function loadInitialAuth() {
  const token = localStorage.getItem('cyberlab_token')
  const userRaw = localStorage.getItem('cyberlab_user')
  if (!token || !userRaw) return { isAuthenticated: false, token: null, user: null }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('cyberlab_token')
      localStorage.removeItem('cyberlab_user')
      return { isAuthenticated: false, token: null, user: null }
    }
    return { isAuthenticated: true, token, user: JSON.parse(userRaw) }
  } catch {
    return { isAuthenticated: false, token: null, user: null }
  }
}

export const useAppStore = create((set, get) => ({
  ...loadInitialAuth(),

  loginWithToken: (token, user) => {
    localStorage.setItem('cyberlab_token', token)
    localStorage.setItem('cyberlab_user', JSON.stringify(user))
    set({ isAuthenticated: true, token, user })
  },

  logout: () => {
    localStorage.removeItem('cyberlab_token')
    localStorage.removeItem('cyberlab_user')
    set({ isAuthenticated: false, token: null, user: null })
  },

  updateUser: (updates) => {
    const user = { ...get().user, ...updates }
    localStorage.setItem('cyberlab_user', JSON.stringify(user))
    set({ user })
  },

  sideNavCollapsed: false,
  setSideNavCollapsed: (v) => set({ sideNavCollapsed: v }),

  unreadCount: getUnreadCount(),
  clearNotifications: () => set({ unreadCount: 0 }),
  decrementUnread: () => set(state => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  activeQuiz: null,
  setActiveQuiz: (quiz) => set({ activeQuiz: quiz }),
  clearActiveQuiz: () => set({ activeQuiz: null }),
}))
