// @flow
import * as React from 'react'
import { useIntl } from 'react-intl'
import { Text } from '@react-pdf/renderer'
import { getLocalizedFieldProp, fieldKeyToLabel } from '../utils/strings'
import type { Field } from '../types'
import { PdfContext } from '../ReportView/ReportView.js'

const styles = {
  groupText: {
    color: '#66666'
  }
}

type Props = {
  field: Field
}

/** Formats a field name nicely */
const FormattedFieldname = ({ field }: Props) => {
  const { locale } = useIntl()
  const isPdf = React.useContext(PdfContext)
  const Component = isPdf ? Text : 'span'
  const label =
    getLocalizedFieldProp(field, 'label', locale) || fieldKeyToLabel(field.key)
  if (typeof label === 'string') {
    return <Component title={label}>{label}</Component>
  } else {
    const groupText = label.slice(0, label.length - 1).join(' / ') + ' / '
    const fieldText = label[label.length - 1]
    return (
      <Component title={groupText + fieldText}>
        <Component style={styles.groupText}>{groupText}</Component>
        <Component>{fieldText}</Component>
      </Component>
    )
  }
}

export default FormattedFieldname
