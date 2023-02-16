import { createMemoizedStats } from './lib/data_analysis/index'

const getStats = createMemoizedStats()

export default observations => {
  return getStats(observations.map(obs => obs.tags || {}))
}
