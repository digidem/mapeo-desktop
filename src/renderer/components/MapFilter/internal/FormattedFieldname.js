// @flow
import * as React from 'react'
import { useIntl } from 'react-intl'
import { getLocalizedFieldProp, fieldKeyToLabel } from '../utils/strings'
import type { Field } from '../types'

const styles = {
  groupText: {
    color: 'rgba(0, 0, 0, 0.541176)'
  }
}

type Props = {
  field: Field,
  // Flow TODO: Make this stricter?
  component?: any
}

/** Formats a field name nicely */
const FormattedFieldname = ({
  field,
  component: Component = 'span'
}: Props) => {
  const { locale } = useIntl()
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
