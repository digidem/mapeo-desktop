// @flow
import * as React from 'react'
import * as coordFormats from '../constants/coord_formats'

type SettingsContextType = {
  coordFormat: $Values<typeof coordFormats>
}
export const defaultSettings: SettingsContextType = {
  coordFormat: coordFormats.UTM
}
export const SettingsContext: React.Context<SettingsContextType> = React.createContext(
  defaultSettings
)
