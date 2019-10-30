/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react'
import { StylesProvider } from '@material-ui/styles'

// import MapFilterToolbar from './Toolbar'

export default {
  title: 'MapFilter/components/Toolbar',
  decorator: [
    storyFn => <StylesProvider injectFirst>{storyFn()}</StylesProvider>
  ]
}

// export const defaultStory = () => {
//   const [view, setView] = React.useState('map')
//   return <MapFilterToolbar view={view} onChange={setView} />
// }

// defaultStory.story = {
//   name: 'default'
// }
