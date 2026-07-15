import { create } from 'zustand'
import { api } from '../lib/api'

const legacyKeys = ['cyberlab_' + 'token', 'cyberlab_' + 'user']
legacyKeys.forEach(key => localStorage.removeItem(key))

let hydrationPromise = null

export const useAppStore = create((set, get) => ({
  isAuthenticated: false,
  authStatus: 'idle',
  user: null,

  setSession: (user) => {
    set({ isAuthenticated: true, authStatus: 'authenticated', user })
  },

  hydrateSession: async () => {
    if (get().authStatus === 'authenticated' || get().authStatus === 'anonymous') return get().user
    if (hydrationPromise) return hydrationPromise
    set({ authStatus: 'loading' })
    hydrationPromise = api.me()
      .then(({ user }) => {
        set({ isAuthenticated: true, authStatus: 'authenticated', user })
        return user
      })
      .catch(() => {
        set({ isAuthenticated: false, authStatus: 'anonymous', user: null })
        return null
      })
      .finally(() => {
        hydrationPromise = null
      })
    return hydrationPromise
  },

  logout: () => {
    set({ isAuthenticated: false, authStatus: 'anonymous', user: null })
  },

  updateUser: (updates) => {
    const user = { ...get().user, ...updates }
    set({ user })
  },

  sideNavCollapsed: false,
  setSideNavCollapsed: (v) => set({ sideNavCollapsed: v }),

  unreadCount: 0,
  clearNotifications: () => set({ unreadCount: 0 }),
  decrementUnread: () => set(state => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  activeQuiz: null,
  setActiveQuiz: (quiz) => set({ activeQuiz: quiz }),
  clearActiveQuiz: () => set({ activeQuiz: null }),
}))
