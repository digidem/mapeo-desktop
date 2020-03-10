// @flow
import { createMemoizedStats } from './lib/data_analysis/index'
import type { Statistics } from './types'
import type { Observation } from 'mapeo-schema'

const getStats = createMemoizedStats()

export default (observations: Array<Observation>): Statistics => {
  return getStats(observations.map(obs => obs.tags || {}))
}
