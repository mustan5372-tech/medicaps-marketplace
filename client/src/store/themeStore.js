import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      dark: false,
      glass: false,
      toggle: () => set({ dark: !get().dark }),
      toggleGlass: () => set({ glass: !get().glass }),
    }),
    { name: 'theme' }
  )
)
