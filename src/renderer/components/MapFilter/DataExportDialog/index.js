import React from 'react'
import Dialog from '@material-ui/core/Dialog'

import ViewWrapper from '../ViewWrapper'
import { Content } from './Content'

export const DataExportDialog = ({
  filter,
  getMediaUrl,
  observations,
  onClose,
  open,
  presets
}) => (
  <Dialog
    fullWidth
    open={open}
    onClose={onClose}
    scroll='body'
    aria-labelledby='responsive-dialog-title'
  >
    {open && (
      <ViewWrapper
        observations={observations}
        presets={presets}
        filter={filter}
        getMediaUrl={getMediaUrl}
      >
        {({ filteredObservations }) => (
          <Content
            allObservations={observations}
            filteredObservations={filteredObservations}
            onClose={onClose}
            getMediaUrl={getMediaUrl}
          />
        )}
      </ViewWrapper>
    )}
  </Dialog>
)
