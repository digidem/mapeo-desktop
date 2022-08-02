// @ts-check
import * as React from 'react'

/**
 * @typedef {{practiceModeOn:boolean}} SettingsContextType
 */

/** @type {SettingsContextType} */
const SettingContextDefault = {
  practiceModeOn: false
}

export const SettingsContext = React.createContext(SettingContextDefault)

/**
 * @typedef SettingsProviderProp
 * @prop {React.ReactNode} children
 * @prop {boolean} practiceModeOn
 */

/** @param {SettingsProviderProp} props */
export const SettingsProvider = ({ children, practiceModeOn }) => {
  const contextValue = React.useMemo(() => ({ practiceModeOn }), [
    practiceModeOn
  ])

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  )
}
