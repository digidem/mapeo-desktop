import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import store from '../store'

const STORE_VERSION = '1.0.0'

/**
 * @type {import('zustand/middleware').StateStorage}
 */
const storage = {
  /**
   * @param {string}  key - A string key to reference the stored item by.
   * @returns {Promise<string | null>}
   */
  getItem: async key => {
    return (await store.get(key)) || null
  },
  /**
   * @param {string}  key - A string key to reference the stored item by.
   * @param {string} state - The state to be persisted - stringified JSON.
   * @returns {Promise<void>}
   */
  setItem: async (key, state) => {
    console.log({ key, state })
    await store.set(key, state)
  },
  /**
   * @param {string}  key - A string key to reference the stored item to be removed.
   */
  removeItem: async key => {
    await store.delete(key)
  },
}

/**
 * @param {unknown} slice - A string key to reference the stored item by.
 * @param {string} storeName - Unique name of the store.
 * @returns {import('zustand').StateCreator}
 */
const createPersistedStore = (slice, storeName) =>
  create(
    persist(slice, {
      name: storeName,
      storage: createJSONStorage(() => storage),
    }),
  )

/**
 * @typedef {import('zustand').StoreApi<T>['setState']} Setter
 * @typedef {boolean} BackgroundMapsFlag
 * @param {Setter} set
 * @param {import('zustand').StoreApi<T>['getState']} get
 * @returns {{
 *  storeVersion: string,
 *  backgroundMaps: BackgroundMapsFlag,
 *  setBackgroundMapsFlag: (backgroundMaps: BackgroundMapsFlag) => Setter
 * }}
 */
const experimentsFlagsStoreSlice = (set, get) => ({
  storeVersion: STORE_VERSION,
  backgroundMaps: false,
  setBackgroundMapsFlag: backgroundMaps => set({ backgroundMaps }),
})

/**
 * @typedef {string} MapStyle
 * @param {Setter} set
 * @param {import('zustand').StoreApi<T>['getState']} get
 * @returns {{
 *  storeVersion: string,
 *  mapStyle: MapStyle,
 *  setMapStyle: (mapStyle: MapStyle) => Setter
 * }}
 */
const backgroundMapStoreSlice = (set, get) => ({
  storeVersion: STORE_VERSION,
  mapStyle: '',
  setMapStyle: mapStyle => set({ mapStyle }),
})

export const useExperimentsFlagsStore = createPersistedStore(experimentsFlagsStoreSlice, 'experiments-flags')
export const useBackgroundMapStore = createPersistedStore(backgroundMapStoreSlice, 'background-maps')
