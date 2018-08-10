import MapEditor from './MapEditor'
import MapFilter from './MapFilter'
import SyncView from './SyncView'

const views = [
  {
    component: MapEditor,
    label: 'Map Editor'
  },
  {
    component: MapFilter,
    label: 'Map Filter'
  },
  {
    component: SyncView,
    label: 'Sync with...',
    modal: true
  }
]

export default views
