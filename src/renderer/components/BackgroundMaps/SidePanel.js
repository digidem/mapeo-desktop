// @ts-check
import { Button, makeStyles } from '@material-ui/core'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useMapServerQuery } from '../../hooks/useMapServerQuery'
import { ImportMapStyleDialog } from '../dialogs/ImportMapStyle'
import Loader from '../Loader'
import { MapCard } from './MapCard'

const m = defineMessages({
  // Button to add map background
  addMap: 'Add Map Background',
  // Button to create an offline area for a map backgroun
  createOfflineMap: 'Create Offline Map',
  // button to go back to settings
  backToSettings: 'Back to Settings',
})
/**
 * @typedef SidePanelProps
 * @prop {()=>void} openSettings
 * @prop {string|false} mapValue
 * @prop {React.Dispatch<React.SetStateAction<string | false>>} setMapValue
 */

/** @param {SidePanelProps} param */
export const SidePanel = ({ openSettings, mapValue, setMapValue }) => {
  const { formatMessage: t } = useIntl()

  const classes = useStyles()
  const [open, setOpen] = React.useState(false)

  const { data, isLoading } = useMapServerQuery('/styles', true)

  return (
    <React.Fragment>
      <div className={classes.sidePanel}>
        <Button onClick={openSettings} className={classes.backHeader}>
          <ChevronLeft />
          {t(m.backToSettings)}
        </Button>
        <div className={classes.buttonContainer}>
          <Button
            onClick={() => setOpen(true)}
            className={`${classes.button} ${classes.firstButton}`}
            variant='outlined'
          >
            {t(m.addMap)}
          </Button>
        </div>

        {isLoading ? (
          <Loader />
        ) : data ? (
          data.map(offlineMap => (
            <MapCard
              setMap={setMapValue}
              key={offlineMap.id}
              offlineMap={offlineMap}
              isBeingViewed={offlineMap.id === mapValue}
            />
          ))
        ) : null}
      </div>
      <ImportMapStyleDialog open={open} close={() => setOpen(false)} />
    </React.Fragment>
  )
}

const useStyles = makeStyles({
  sidePanel: {
    width: 'auto',
    borderRight: '1px solid #E0E0E0',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '35%',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 20,
  },
  button: {
    textTransform: 'none',
    fontSize: 12,
  },
  firstButton: {
    marginRight: 10,
  },
  backHeader: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    paddingLeft: 20,
    paddingTop: 20,
    paddingBottom: 20,
    width: '100%',
    display: 'flex',
    textTransform: 'none',
    '& :first-child': {
      marginRight: 20,
    },
  },
})
