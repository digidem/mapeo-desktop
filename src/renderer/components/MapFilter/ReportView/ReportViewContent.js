// @flow
import React, { useState, useMemo, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  DialogContent,
  DialogContentText,
  Dialog,
  CircularProgress,
  Button,
  ButtonGroup,
  Typography
} from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import EditIcon from '@material-ui/icons/Edit'

import { defineMessages, FormattedMessage, useIntl } from 'react-intl'
import { saveAs } from 'file-saver'

import Toolbar from '../internal/Toolbar'
import HideFieldsButton from './HideFieldsButton'
import { fieldKeyToLabel } from '../utils/strings'
import getStats from '../stats'
import PDFViewer from './PDFViewer'
import SaveButton from './SaveButton'
import usePDFPreview from './usePDFPreview'
import type { Observation } from 'mapeo-schema'
import type {
  PresetWithAdditionalFields,
  FieldState,
  Field,
  CommonViewContentProps
} from '../types'
import { type MapViewContentProps } from '../MapView/MapViewContent'
import { SettingsContext } from '../internal/Context'
import renderPDFReport from './renderReport'
import ToolbarButton from '../internal/ToolbarButton'

export type ReportViewContentProps = {
  ...$Exact<CommonViewContentProps>,
  mapStyle: $PropertyType<MapViewContentProps, 'mapStyle'>,
  mapboxAccessToken: $PropertyType<MapViewContentProps, 'mapboxAccessToken'>,
  initialPageNumber?: number,
  totalObservations: number
}

const m = defineMessages({
  // Button for navigating to the next page in the report
  nextPage: 'Next',
  // Button for nagivating to the previous page in the report
  prevPage: 'Previous',
  // Text showing the current page number when previewing a report
  currentPage: 'Page {currentPage}',
  // Shown while the report is generating when saving or printing
  savingProgress: 'Generating report…',
  // Default filename for a report (prefixed with date as YYYY-MM-YY)
  defaultReportName: 'Mapeo Observation Report.pdf',
  xOfY: 'showing {observationCount} of {totalObservations} observations'
})

const hiddenTags = {
  categoryId: true,
  notes: true,
  note: true
}

const ReportViewContent = ({
  onClick,
  observations,
  getMedia,
  getPreset,
  initialPageNumber = 1,
  totalObservations,
  mapboxAccessToken,
  mapStyle
}: ReportViewContentProps) => {
  const stats = useMemo(() => getStats(observations || []), [observations])
  const intl = useIntl()
  const settings = React.useContext(SettingsContext)
  const cx = useStyles()
  const [currentPage, setCurrentPage] = React.useState(initialPageNumber)
  const [isSaving, setIsSaving] = React.useState(false)

  const [fieldState, setFieldState] = useState(() => {
    // Lazy initial state to avoid this being calculated on every render
    return Object.keys(stats)
      .filter(key => {
        // Hacky: don't include categoryId and notes in options of fields you can hide
        const fieldKey = JSON.parse(key)
        const fieldKeyString = Array.isArray(fieldKey) ? fieldKey[0] : fieldKey
        if (hiddenTags[fieldKeyString]) return false
        return true
      })
      .map(key => {
        const fieldKey = JSON.parse(key)
        const label = fieldKeyToLabel(fieldKey)
        return {
          id: key,
          hidden: false,
          label: Array.isArray(label) ? label.join('.') : label
        }
      })
  })

  // WARNING: If this changes between renders, then the PDF will need to
  // re-index which will take some time.
  const getPresetWithFilteredFields = useCallback(
    (observation: Observation): PresetWithAdditionalFields => {
      const preset = getPreset(observation)
      return {
        ...preset,
        fields: preset.fields.filter(hiddenFieldsFilter(fieldState)),
        additionalFields: preset.additionalFields.filter(
          hiddenFieldsFilter(fieldState)
        )
      }
    },
    [fieldState, getPreset]
  )

  async function handleSaveClick () {
    setIsSaving(true)
    const { blob } = await renderPDFReport({
      observations,
      intl,
      settings,
      getPreset: getPresetWithFilteredFields,
      getMedia,
      mapboxAccessToken,
      mapStyle
    })
    // Prefix filename with date `YYYY-MM-DD`
    const datePrefix = new Date().toISOString().split('T')[0]
    const name = intl.formatMessage(m.defaultReportName)
    saveAs(blob, `${datePrefix} ${name}`)
    setIsSaving(false)
  }

  // observations and getPreset should be stable between renders in order for
  // caching to work
  const {
    blob,
    state: pdfState,
    pageNumber: pdfPageNumber,
    isLastPage,
    observationId
  } = usePDFPreview({
    currentPage,
    observations,
    intl,
    settings,
    getPreset: getPresetWithFilteredFields,
    getMedia,
    mapboxAccessToken,
    mapStyle
  })

  // If there is an error generating the PDF preview, try resetting to page 1
  // (this can happen when changing a filter results in a report with fewer
  // pages than the current page number)
  React.useEffect(() => {
    if (pdfState === 'error' && currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [pdfState, currentPage])

  return (
    <>
      <div className={cx.root}>
        <Toolbar>
          <div>
            <HideFieldsButton
              fieldState={fieldState}
              onFieldStateUpdate={setFieldState}
            />
            <SaveButton
              shouldConfirm={observations.length > 50}
              observationCount={observations.length}
              onClick={handleSaveClick}
            />
          </div>
          <div>
            <Typography variant='body1' className={cx.xOfY}>
              <FormattedMessage
                {...m.xOfY}
                values={{
                  observationCount: observations.length,
                  totalObservations
                }}
              />
            </Typography>
          </div>
          <div>
            <EditButton
              className={cx.editButton}
              disabled={!observationId}
              onClick={observationId ? () => onClick(observationId) : undefined}
            />
          </div>
        </Toolbar>

        <PDFViewer pdf={blob} pdfState={pdfState} pageNumber={pdfPageNumber} />
        <SavingDialog open={isSaving} />
      </div>
      <PageNavigator
        currentPage={currentPage}
        last={isLastPage}
        setCurrentPage={setCurrentPage}
      />
    </>
  )
}

const EditButton = ({ onClick, ...otherProps }: { onClick?: () => any }) => (
  <ToolbarButton
    onClick={onClick}
    variant='outlined'
    {...otherProps}
    startIcon={<EditIcon />}
  >
    Edit
  </ToolbarButton>
)

export const SavingDialog = ({ open }: { open: boolean }) => {
  const cx = useStyles()
  return (
    <Dialog
      open={open}
      disableBackdropClick
      disableEscapeKeyDown
      fullWidth
      maxWidth='xs'
    >
      <DialogContent className={cx.savingDialogContent}>
        <CircularProgress />
        <DialogContentText className={cx.savingDialogText}>
          <FormattedMessage {...m.savingProgress} />
        </DialogContentText>
      </DialogContent>
    </Dialog>
  )
}

type PageNavigatorProps = {
  currentPage: number,
  last?: boolean,
  setCurrentPage: (pageNumber: number) => any
}

export const PageNavigator = ({
  currentPage,
  last,
  setCurrentPage
}: PageNavigatorProps) => {
  const cx = useStyles()
  const handleNextPage = () => {
    var page = last ? currentPage : currentPage + 1
    setCurrentPage(page)
  }
  const handlePrevPage = () => {
    var page = Math.max(currentPage - 1, 1)
    setCurrentPage(page)
  }

  return (
    <ButtonGroup
      color='primary'
      variant='contained'
      size='large'
      aria-label='Page navigator button group'
      className={cx.navigator}
    >
      <Button
        disabled={currentPage === 1}
        onClick={handlePrevPage}
        startIcon={<ArrowBackIcon />}
      >
        <FormattedMessage {...m.prevPage} />
      </Button>
      <Button disabled className={cx.navigatorPageButton}>
        <FormattedMessage {...m.currentPage} values={{ currentPage }} />
      </Button>
      <Button
        disabled={last}
        onClick={handleNextPage}
        endIcon={<ArrowForwardIcon />}
      >
        <FormattedMessage {...m.nextPage} />
      </Button>
    </ButtonGroup>
  )
}

function hiddenFieldsFilter (fieldState: FieldState) {
  return function (field: Field): boolean {
    const state = fieldState.find(fs => {
      const id = JSON.stringify(
        Array.isArray(field.key) ? field.key : [field.key]
      )
      return fs.id === id
    })
    return state ? !state.hidden : true
  }
}

export default ReportViewContent

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    width: '100%',
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
    overflowY: 'scroll',
    paddingBottom: 20
  },
  xOfY: {
    fontStyle: 'italic',
    color: 'rgba(0,0,0,0.7)'
  },
  savingDialogContent: {
    display: 'flex',
    paddingBottom: 20,
    alignItems: 'center'
  },
  savingDialogText: {
    marginBottom: 0,
    marginLeft: 15
  },
  navigator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translate(-50%, 0)',
    zIndex: 99,
    display: 'inline-grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    '& .MuiButton-contained': {
      textTransform: 'none',
      backgroundColor: '#000630',
      color: theme.palette.primary.contrastText,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      '&:hover': {
        backgroundColor: '#323659'
      },
      '&:not(:last-child)': {
        borderRight: '1px solid #404363'
      }
    },
    '& .Mui-disabled:not(:nth-child(2))': {
      color: '#656882'
    }
  },
  navigatorPageButton: {
    paddingLeft: 30,
    paddingRight: 30
  }
}))
