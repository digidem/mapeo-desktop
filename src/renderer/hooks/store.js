// @ts-check
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import store from '../../persist-store'
import { DEFAULT_MAP } from './useMapStylesQuery'

/**
 * @typedef { {
 * id: string,
 * url: string,
 * bytesStored: number,
 * name: import('react-intl').MessageDescriptor | string,
 * isDefault?: boolean,
 * isImporting?: boolean
 * }} MapStyle
 */

/**
 * @type {import('zustand/middleware').StateStorage}
 */
const storage = {
  getItem: key => {
    /**
     * @type {string | null}
     */
    return store.get(key, null)
  },
  setItem: (key, state) => {
    store.set(key, state)
  },
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
 *  mapStyleLegacy: MapStyle,
 *  mapStyleMapServer: MapStyle,
 *  setMapStyleLegacy: (mapStyle:MapStyle) => void,
 *  setMapStyleServer: (mapStyle:MapStyle) => void
 * }} BackgroundMapStoreSlice
 */
/**
 * @type {import('zustand').StateCreator<BackgroundMapStoreSlice>}
 */
const backgroundMapStoreSlice = (set, get) => {
  return {
    mapStyleLegacy: DEFAULT_MAP,
    mapStyleMapServer: DEFAULT_MAP,
    setMapStyleLegacy: mapStyle => set({ mapStyleLegacy: mapStyle }),
    setMapStyleServer: mapStyle => set({ mapStyleMapServer: mapStyle })
  }
}

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

const useBackgroundMapState = createPersistedStore(
  backgroundMapStoreSlice,
  'background-maps'
)
export const usePersistedUiStore = createPersistedStore(
  persistedUiStoreSlice,
  'ui'
)

/**
 *
 * @returns {[MapStyle, (mapStyle: MapStyle) => void]}
 */
export const useBackgroundMapStore = () => {
  const backgroundMapsEnabled = useExperimentsFlagsStore(
    store => store.backgroundMaps
  )

  const [mapStyle, setMapStyle] = useBackgroundMapState(store =>
    backgroundMapsEnabled
      ? [store.mapStyleMapServer, store.setMapStyleServer]
      : [store.mapStyleLegacy, store.setMapStyleLegacy]
  )

  return [mapStyle, setMapStyle]
}
