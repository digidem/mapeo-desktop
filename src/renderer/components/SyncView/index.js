import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { makeStyles } from '@material-ui/core'
import { remote } from 'electron'
import { useIntl, defineMessages } from 'react-intl'
import path from 'path'

import logger from '../../../logger'
import api from '../../new-api'
import Searching from './Searching'
import SyncAppBar from './SyncAppBar'
import SyncTarget from './SyncTarget'
import SyncGrid from './SyncGrid'

export const peerStatus = {
  READY: 'ready',
  PROGRESS: 'progress',
  ERROR: 'error',
  COMPLETE: 'complete'
}

const m = defineMessages({
  openSyncFileDialog: 'Select a database to syncronize',
  createSyncFileDialog: 'Create a new database to syncronize',
  // Error message when trying to sync with an incompatible older version of Mapeo
  errorMsgVersionThemBad: '{deviceName} needs to upgrade Mapeo',
  // Error messagewhen trying to sync with an incompatible newer version of Mapeo
  errorMsgVersionUsBad: 'You need to upgrade Mapeo to sync with {deviceName}'
})

const fileDialogFilters = [
  {
    name: 'Mapeo Data (*.mapeodata)',
    extensions: ['mapeodata', 'mapeo-jungle', 'sync', 'zip']
  }
]

const SyncView = ({ focusState }) => {
  const cx = useStyles()
  const listenForSyncPeers = focusState === 'focused'
  const [peers, syncPeer] = usePeers(listenForSyncPeers)
  const { formatMessage: t } = useIntl()
  logger.log('render peers', peers)

  const handleClickSelectSyncfile = () => {
    remote.dialog.showOpenDialog(
      {
        title: t(m.openSyncFileDialog),
        properties: ['openFile'],
        filters: fileDialogFilters
      },
      filenames => {
        if (typeof filenames === 'undefined' || filenames.length !== 1) return
        syncPeer(filenames[0], { file: true })
      }
    )
  }

  const handleClickNewSyncfile = () => {
    remote.dialog.showSaveDialog(
      {
        title: t(m.openSyncFileDialog),
        defaultPath: 'database.mapeodata',
        filters: fileDialogFilters
      },
      filename => {
        if (!filename) return
        syncPeer(filename, { file: true })
      }
    )
  }

  return (
    <div className={cx.root}>
      <SyncAppBar
        onClickSelectSyncfile={handleClickSelectSyncfile}
        onClickNewSyncfile={handleClickNewSyncfile}
      />
      {peers.length === 0 && focusState === 'focused' ? (
        <Searching />
      ) : (
        <SyncGrid>
          {peers.map(peer => (
            <SyncTarget
              key={peer.id}
              {...peer}
              onClick={() => syncPeer(peer.id)}
            />
          ))}
        </SyncGrid>
      )}
    </div>
  )
}

export default SyncView

function usePeers (listen) {
  const { formatMessage } = useIntl()
  const lastClosed = useRef(Date.now())
  const [serverPeers, setServerPeers] = useState([])
  const [syncErrors, setSyncErrors] = useState(new Map())
  const [syncRequests, setSyncRequests] = useState(new Map())

  // Keep a ref of the last time this view was closed (used to maintain peer
  // "completed" state in the UI)
  useEffect(
    () => {
      if (!listen) lastClosed.current = Date.now()
    },
    [listen]
  )

  useEffect(
    () => {
      // Only start listening if `listen` is true
      if (!listen) return

      const updatePeers = (updatedServerPeers = []) => {
        logger.log('Received peer update', updatedServerPeers)
        setServerPeers(updatedServerPeers)
        // NB: use callback version of setState because the new error state
        // depends on the previous error state
        setSyncErrors(syncErrors => {
          const newErrors = new Map(syncErrors)
          updatedServerPeers.forEach(peer => {
            if (peer.state && peer.state.topic === 'replication-error') {
              newErrors.set(peer.id, peer.state)
            }
          })
          return newErrors
        })
        // Argh, this is hacky. This is making up for us not being able to rely
        // on server state for rendering the UI
        setSyncRequests(syncRequests => {
          const newSyncRequests = new Map(syncRequests)
          updatedServerPeers.forEach(peer => {
            if (!peer.state) return
            if (
              peer.state.topic === 'replication-error' ||
              peer.state.topic === 'replication-complete'
            ) {
              newSyncRequests.delete(peer.id)
            }
          })
          return newSyncRequests
        })
      }

      // Whenever the sync view becomes focused, announce for sync and start
      // listening for updates to peer status
      api.syncJoin()
      const peerListener = api.addPeerListener(updatePeers)

      // When the listen changes or component unmounts, cleanup listeners
      return () => {
        api.syncLeave()
        if (peerListener) peerListener.remove()
      }
    },
    [listen]
  )

  const peers = useMemo(
    () =>
      getPeersStatus({
        syncRequests,
        serverPeers,
        syncErrors,
        since: lastClosed.current,
        formatMessage
      }),
    [serverPeers, syncErrors, syncRequests, formatMessage]
  )

  const syncPeer = useCallback(
    (peerId, opts) => {
      logger.log('Request sync start', peerId, serverPeers)
      if (opts && opts.file) return api.syncStart({ filename: peerId })
      const peer = serverPeers.find(peer => peer.id === peerId)
      // Peer could have vanished in the moment the button was pressed
      if (peer) {
        // The server does always respond immediately with progress, especially
        // if the two devices are already up to sync. We store the request state
        // so the user can see the UI update when they click the button
        setSyncRequests(syncRequests => {
          const newSyncRequests = new Map(syncRequests)
          newSyncRequests.set(peerId, true)
          return newSyncRequests
        })
        api.syncStart(peer)
      }
    },
    [serverPeers]
  )

  return [peers, syncPeer]
}

/**
 * The peer status from Mapeo Core does not 'remember' the completion of a sync.
 * If the user is not looking at the screen when sync completes, they might miss
 * it. This function derives a peer status from the server state and any errors
 */
function getPeersStatus ({
  serverPeers = [],
  syncErrors,
  syncRequests,
  since,
  formatMessage
}) {
  logger.log('get peers status', serverPeers, syncErrors)
  return serverPeers.map(serverPeer => {
    let status = peerStatus.READY
    let errorMsg
    let complete
    const state = serverPeer.state || {}
    const name = serverPeer.filename
      ? path.basename(serverPeer.name)
      : serverPeer.name
    if (
      state.topic === 'replication-progress' ||
      state.topic === 'replication-started' ||
      syncRequests.has(serverPeer.id)
    ) {
      status = peerStatus.PROGRESS
    } else if (
      syncErrors.has(serverPeer.id) ||
      state.topic === 'replication-error'
    ) {
      status = peerStatus.ERROR
      const error = syncErrors.get(serverPeer.id)
      if (error && error.code === 'ERR_VERSION_MISMATCH') {
        if (
          parseVersionMajor(state.usVersion || '') >
          parseVersionMajor(state.themVersion || '')
        ) {
          errorMsg = formatMessage(m.errorMsgVersionThemBad, {
            deviceName: name
          })
        } else {
          errorMsg = formatMessage(m.errorMsgVersionUsBad, { deviceName: name })
        }
      } else if (error) {
        errorMsg = error.message || 'Error'
      }
    } else if (
      (state.lastCompletedDate || 0) > since ||
      state.topic === 'replication-complete'
    ) {
      status = peerStatus.COMPLETE
      complete = state.message
    }
    return {
      id: serverPeer.id,
      name: name,
      status: status,
      lastCompleted: complete || state.lastCompletedDate,
      errorMsg: errorMsg,
      progress: getPeerProgress(serverPeer.state),
      deviceType: serverPeer.filename ? 'file' : serverPeer.deviceType
    }
  })
}

// We combine media and database items in progress. In order to show roughtly
// accurate progress, this weighting is how much more progress a media item
// counts vs. a database item
const MEDIA_WEIGHTING = 50
function getPeerProgress (peerState) {
  if (
    !peerState ||
    peerState.topic !== 'replication-progress' ||
    !peerState.message ||
    !peerState.message.db ||
    !peerState.message.media
  ) {
    return
  }
  const total =
    (peerState.message.db.total || 0) +
    (peerState.message.media.total || 0) * MEDIA_WEIGHTING
  const sofar =
    (peerState.message.db.sofar || 0) +
    (peerState.message.media.sofar || 0) * MEDIA_WEIGHTING
  const progress = total > 0 ? sofar / total : 0
  // Round progress to 2-decimal places. PeerItem is memoized, so it will not
  // update if progress does not change. Without rounding PeerItem updates
  // unnecessarily on every progress change, when we are only showing the user a
  // rounded percentage progress. Increase this to 3-decimal places if you want
  // to show more detail to the user.
  return {
    percent: Math.round(progress * 100) / 100,
    mediaSofar: peerState.message.media.sofar || 0,
    mediaTotal: peerState.message.media.total || 0,
    dbSofar: peerState.message.db.sofar || 0,
    dbTotal: peerState.message.db.total || 0
  }
}

export function parseVersionMajor (versionString = '') {
  const major = Number.parseInt(versionString.split('.')[0])
  return isNaN(major) ? 0 : major
}

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    width: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F5F5F5'
  }
}))
