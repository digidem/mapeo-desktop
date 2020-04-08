import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select'
import Dialog from '@material-ui/core/Dialog'
import MenuItem from '@material-ui/core/MenuItem'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'
import React, { useState } from 'react'
import { ipcRenderer } from 'electron'

import { defineMessages, useIntl } from 'react-intl'

const languages = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  pt: 'Português'
}

const m = defineMessages({
  'dialog-enter-language': 'Choose a language',
  'button-submit': 'Submit'
})

const ChangeLanguage = ({ onClose, open }) => {
  const { formatMessage: t, locale } = useIntl()
  // Set default state to app locale
  const [lang, setLang] = useState(locale)

  const submitHandler = event => {
    ipcRenderer.send('set-locale', lang)
    onClose()
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    return false
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t(m['dialog-enter-language'])}</DialogTitle>
      <DialogContent>
        <FormControl>
          <Select
            id='dialog-change-language'
            value={lang}
            onChange={event => setLang(event.target.value)}
          >
            {Object.keys(languages).map(code => (
              <MenuItem key={code} value={code}>
                {languages[code]} ({code})
              </MenuItem>
            ))}
          </Select>
          <DialogActions>
            <Button onClick={submitHandler}>{t(m['button-submit'])}</Button>
          </DialogActions>
        </FormControl>
      </DialogContent>
    </Dialog>
  )
}

export default ChangeLanguage
