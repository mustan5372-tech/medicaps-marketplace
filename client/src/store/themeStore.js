import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      dark: false,
      glass: true,  // glass theme on by default for first-time visitors
      toggle: () => set({ dark: !get().dark }),
      toggleGlass: () => set({ glass: !get().glass }),
    }),
    { name: 'theme' }
  )
)
