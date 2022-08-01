// @ts-check
import * as React from 'react'

/**
 * @typedef {{practiceModeOn:boolean, invite:string|null}} SettingsContextType
 */

/** @type {SettingsContextType} */
const SettingContextDefault = { practiceModeOn: false, invite: null }

export const SettingsContext = React.createContext(SettingContextDefault)

/**
 * @typedef SettingsProviderProp
 * @prop {React.ReactNode} children
 * @prop {boolean} practiceModeOn
 * @prop {string|null} invite
 */

/** @param {SettingsProviderProp} props */
export const SettingsProvider = ({ children, practiceModeOn, invite }) => {
  const contextValue = React.useMemo(() => ({ practiceModeOn, invite }), [
    practiceModeOn,
    invite
  ])

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  )
}
