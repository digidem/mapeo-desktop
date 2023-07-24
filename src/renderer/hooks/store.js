import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import store from '../../persist-store'

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
   * @param {string} key - A string key to reference the stored item by.
   * @param {string} state - The state to be persisted - stringified JSON.
   * @returns {Promise<void>}
   */
  setItem: async (key, state) => {
    await store.set(key, state)
  },
  /**
   * @param {string}  key - A string key to reference the stored item to be removed.
   */
  removeItem: async key => {
    await store.delete(key)
  }
}

/**
 * @param {(set: Setter, get: Getter) => unknown} slice - A string key to reference the stored item by.
 * @param {string} storeName - Unique name of the store.
 * @returns {import('zustand').StateCreator}
 */
const createPersistedStore = (slice, storeName) =>
  create(
    persist(slice, {
      name: storeName,
      storage: createJSONStorage(() => storage)
    })
  )

/**
 * @typedef {import('zustand').StoreApi<T>['setState']} Setter
 * @typedef {import('zustand').StoreApi<T>['getState']} Getter
 * @typedef {boolean} BackgroundMapsFlag
 * @param {Setter} set
 * @param {Getter} get
 * @returns {{
 *  backgroundMaps: BackgroundMapsFlag,
 *  setBackgroundMapsFlag: (backgroundMaps: BackgroundMapsFlag) => Setter
 * }}
 */
const experimentsFlagsStoreSlice = (set, get) => ({
  backgroundMaps: false,
  setBackgroundMapsFlag: backgroundMaps => set({ backgroundMaps })
})

/**
 * @typedef {string} MapStyle
 * @param {Setter} set
 * @param {Getter} get
 * @returns {{
 *  mapStyle: MapStyle,
 *  setMapStyle: (mapStyle: MapStyle) => Setter
 * }}
 */
const backgroundMapStoreSlice = (set, get) => ({
  mapStyle: '',
  setMapStyle: mapStyle => set({ mapStyle })
})

/**
 * @param {Setter} set
 * @param {Getter} get
 * @returns {{
 *  tabIndex: number,
 *  setTabIndex: (tabIndex: number) => Setter
 * }}
 */
const persistedUiStoreSlice = (set, get) => ({
  tabIndex: 0,
  setTabIndex: tabIndex => set({ tabIndex })
})

export const useExperimentsFlagsStore = createPersistedStore(
  experimentsFlagsStoreSlice,
  'experiments-flags'
)
export const useBackgroundMapStore = createPersistedStore(
  backgroundMapStoreSlice,
  'background-maps'
)
export const usePersistedUiStore = createPersistedStore(
  persistedUiStoreSlice,
  'ui'
)
