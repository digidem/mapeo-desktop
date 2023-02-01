import React from 'react'
import remote from '@electron/remote'
import styled from 'styled-components'

const TitleBarArea = styled.div`
  position: relative;
  height: 22px;
`

// Create a space for MacOS title bar buttons on a frameless Window
const TitleBarShim = () => {
  const win = remote.getCurrentWindow()
  const titleBarSize = win.getSize()[1] - win.getContentSize()[1]
  if (titleBarSize > 0) return null
  return <TitleBarArea />
}

export default TitleBarShim
