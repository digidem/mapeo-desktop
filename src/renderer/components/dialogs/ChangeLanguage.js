import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select'
import Dialog from '@material-ui/core/Dialog'
import MenuItem from '@material-ui/core/MenuItem'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'
import React, { useState } from 'react'

import { defineMessages, useIntl } from 'react-intl'

const languages = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  pt: 'Português',
  th: 'Thai',
  vi: 'Vietnamese',
  km: 'Khmer'
}

const m = defineMessages({
  'dialog-enter-language': 'Choose a language',
  'button-submit': 'Submit',
  'button-cancel': 'Cancel'
})

const ChangeLanguage = ({ onCancel, onSelectLanguage, open }) => {
  const { formatMessage: t, locale } = useIntl()
  // Set default state to app locale
  const [lang, setLang] = useState(locale)

  const submitHandler = () => {
    onSelectLanguage(lang)
  }

  const closeHandler = () => {
    // This will remember state between open/close, so if the user cancels this
    // should reset to the currently selected locale
    setLang(locale)
    onCancel()
  }

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth='xs'>
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
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button color='default' onClick={closeHandler}>
          {t(m['button-cancel'])}
        </Button>
        <Button color='primary' onClick={submitHandler}>
          {t(m['button-submit'])}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ChangeLanguage
