import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import store from '../store'

const STORE_VERSION = '1.0.0'

const storage = {
  getItem: async key => {
    return (await store.get(key)) || null
  },
  setItem: async (key, state) => {
    await store.set(key, state)
  },
  removeItem: async key => {
    await store.delete(key)
  },
}

const createPersistedStore = (storeShape, storeName) =>
  create(
    persist(storeShape, {
      name: storeName,
      storage: createJSONStorage(() => storage),
    }),
  )

const experimentsFlagsStoreSlice = (set, get) => ({
  storeVersion: STORE_VERSION,
  backgroundMaps: false,
  setBackgroundMapsFlag: backgroundMaps => set({ backgroundMaps }),
})

const backgroundMapStoreSlice = (set, get) => ({
  storeVersion: STORE_VERSION,
  mapStyle: '',
  setMapStyle: mapStyle => set({ mapStyle }),
})

export const useExperimentsFlagsStore = createPersistedStore(experimentsFlagsStoreSlice, 'experiments-flags')
export const useBackgroundMapStore = createPersistedStore(backgroundMapStoreSlice, 'background-maps')
