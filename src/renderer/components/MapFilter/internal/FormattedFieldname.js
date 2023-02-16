//
import * as React from 'react'
import { useIntl } from 'react-intl'
import { getLocalizedFieldProp, fieldKeyToLabel } from '../utils/strings'

const styles = {
  groupText: {
    color: 'rgba(0, 0, 0, 0.541176)'
  }
}

/** Formats a field name nicely */
const FormattedFieldname = ({ field }) => {
  const { locale } = useIntl()
  const label =
    getLocalizedFieldProp(field, 'label', locale) || fieldKeyToLabel(field.key)
  if (typeof label === 'string') {
    return <span title={label}>{label}</span>
  } else {
    const groupText = label.slice(0, label.length - 1).join(' / ') + ' / '
    const fieldText = label[label.length - 1]
    return (
      <span title={groupText + fieldText}>
        <span style={styles.groupText}>{groupText}</span>
        <span>{fieldText}</span>
      </span>
    )
  }
}

export default FormattedFieldname
