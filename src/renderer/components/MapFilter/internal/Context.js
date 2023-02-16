//
import * as React from 'react'
import * as coordFormats from '../constants/coord_formats'

export const defaultSettings = {
  coordFormat: coordFormats.UTM
}
export const SettingsContext = React.createContext(defaultSettings)
