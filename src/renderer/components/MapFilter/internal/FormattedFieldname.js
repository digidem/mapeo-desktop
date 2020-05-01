// @flow
import * as React from 'react'
import { useIntl } from 'react-intl'
import { getLocalizedFieldProp, fieldKeyToLabel } from '../utils/strings'
import type { Field } from '../types'

const styles = {
  groupText: {
    color: '#66666'
  }
}

type Props = {
  field: Field
}

type PureProps = {
  ...Props,
  locale: string,
  Component: React.Element
}

// No context here, so we can use it in ReactPDF
export const FormattedFieldnamePure = ({ field, locale, component: Component = 'span' }: PureProps) => {
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

/** Formats a field name nicely */
const FormattedFieldname = (props: Props) => {
  const { locale } = useIntl()
  return <FormattedFieldnamePure {...props} locale={locale} />
}

export default FormattedFieldname
