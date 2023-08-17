// @ts-check
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import store from '../../persist-store'

/**
 * @type {import('zustand/middleware').StateStorage}
 */
const storage = {
  /**
   * @param {string}  key - A string key to reference the stored item by.
   * @returns {string | null}
   */
  getItem: key => {
    const item = store.get(key)
    return item ? JSON.stringify(item) : null
  },
  /**
   * @param {string} key - A string key to reference the stored item by.
   * @param {string} state - The state to be persisted - stringified JSON.
   * @returns {void}
   */
  setItem: (key, state) => {
    if (typeof state === 'string') {
      store.set(key, JSON.parse(state))
    } else {
      store.set(key, state)
    }
  },
  /**
   * @param {string}  key - A string key to reference the stored item to be removed.
   */
  removeItem: key => {
    store.delete(key)
  }
}

/**
 * @template T
 * @param {import('zustand').StateCreator<T>} slice
 * @param {string} storeName
 * @returns {import('zustand').UseBoundStore<import('zustand').StoreApi<T>>}
 */
const createPersistedStore = (slice, storeName) =>
  create(
    persist(slice, {
      name: storeName,
      storage: createJSONStorage(() => storage)
    })
  )

/**
 * @typedef {{
 *  backgroundMaps: boolean,
 *  setBackgroundMapsFlag: (backgroundMaps:boolean) => void,
 * }} ExperimentsFlagsStoreSlice
 */

/**
 * @type {import('zustand').StateCreator<ExperimentsFlagsStoreSlice>}
 */
const experimentsFlagsStoreSlice = (set, get) => ({
  backgroundMaps: false,
  setBackgroundMapsFlag: backgroundMaps => set({ backgroundMaps })
})

/**
 * @typedef {{
 *  mapStyle: string,
 *  setMapStyle: (mapStyle: string) => void
 * }} BackgroundMapStoreSlice
 */
/**
 * @type {import('zustand').StateCreator<BackgroundMapStoreSlice>}
 */
const backgroundMapStoreSlice = (set, get) => ({
  mapStyle: '',
  setMapStyle: mapStyle => set({ mapStyle })
})

/**
 * @typedef {{
 *  tabIndex: number,
 *  setTabIndex: (tabIndex: number) => void
 * }} PersistedUiStoreSlice
 */
/**
 * @type {import('zustand').StateCreator<PersistedUiStoreSlice>}
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
