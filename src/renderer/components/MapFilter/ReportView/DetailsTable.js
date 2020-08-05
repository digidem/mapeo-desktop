// @flow
import * as React from 'react'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import AutoSizer from 'react-virtualized-auto-sizer'

import FormattedValue from '../internal/FormattedValue'
import FormattedFieldname from '../internal/FormattedFieldname'
import { get } from '../utils/get_set'

import type { Field, JSONObject, Primitive } from '../types'

const styles = {
  root: {
    overflow: 'auto'
  },
  row: {
    verticalAlign: 'top',
    position: 'relative'
  },
  col1: {
    // padding: '14px 12px 14px 24px'
  },
  col1Text: {
    fontWeight: 500,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    direction: 'rtl'
  },
  col2: {
    // padding: '14px 24px 14px 12px !important',
    width: '100%',
    maxWidth: 0,
    whiteSpace: 'initial',
    fontSize: '0.875rem'
  },
  col2Edit: {
    paddingTop: '9px !important',
    paddingBottom: '9px !important'
  },
  col2TextEdit: {
    paddingTop: 5,
    paddingBottom: 5
  },
  col2Text: {
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  input: {
    fontSize: 'inherit'
  }
}

const useStyles = makeStyles(styles)

// function coerceValue(
//   value: Primitive | Array<Primitive>,
//   type: $Values<typeof valueTypes>
// ) {
//   try {
//     return throwableCoerceValue(value, type)
//   } catch (e) {}
// }

// const shouldNotWrap = {
//   [FIELD_TYPES.UUID]: true,
//   [FIELD_TYPES.IMAGE_URL]: true,
//   [FIELD_TYPES.VIDEO_URL]: true,
//   [FIELD_TYPES.MEDIA_URL]: true,
//   [FIELD_TYPES.AUDIO_URL]: true
// }

// const ValueCellEdit = makePure(
//   ({
//     value,
//     type,
//     rowKey,
//     coordFormat,
//     fieldMetadata = {},
//     onChange,
//     classes
//   }) => {
//     const suggestions =
//       Array.isArray(fieldMetadata.values) &&
//       fieldMetadata.values.map(d => d.value)
//     const isDiscreteField =
//       type === FIELD_TYPES.STRING &&
//       fieldMetadata.values &&
//       fieldMetadata.values.length / fieldMetadata.count < 0.8
//     if (isDiscreteField) {
//       return (
//         <Select
//           value={value}
//           onChange={(e, { newValue, type }) => onChange(rowKey, newValue)}
//           suggestions={suggestions}
//           style={styles.selectField}
//         />
//       )
//     }
//     if (type === FIELD_TYPES.BOOLEAN) {
//       return (
//         <MUISelect
//           MenuProps={{ MenuListProps: { dense: true } }}
//           fullWidth
//           autoWidth
//           value={value + ''}
//           onChange={e => {
//             const newValue =
//               e.target.value === 'true'
//                 ? true
//                 : e.target.value === 'false'
//                   ? false
//                   : undefined
//             onChange(rowKey, newValue)
//           }}
//           input={<Input className={classes.input} />}
//           style={styles.muiSelect}>
//           <MenuItem value="undefined" />
//           <MenuItem value="true">Yes</MenuItem>
//           <MenuItem value="false">No</MenuItem>
//         </MUISelect>
//       )
//     }
//     if (type === FIELD_TYPES.STRING) {
//       return (
//         <TextField
//           InputClassName={classes.input}
//           fullWidth
//           multiline
//           value={value}
//           onChange={e => onChange(rowKey, e.target.value)}
//           style={styles.textField}
//         />
//       )
//     }
//     if (type === FIELD_TYPES.ARRAY) {
//       return (
//         <MultiSelect
//           value={value}
//           onChange={(e, { newValue, type }) => onChange(rowKey, newValue)}
//           suggestions={suggestions}
//           style={styles.selectField}
//         />
//       )
//     }
//     return (
//       <ValueCell
//         value={value}
//         type={type}
//         coordFormat={coordFormat}
//         editMode
//         classes={classes}
//       />
//     )
//   }
// )

const Label = ({ style, field }: { style: {}, field: Field }) => {
  const classes = useStyles()
  return (
    <TableCell className={classes.col1} style={style}>
      <Typography className={classes.col1Text}>
        <FormattedFieldname field={field} />
      </Typography>
    </TableCell>
  )
}

type ValueProps = {
  value: Primitive | Array<Primitive>,
  field: Field
}

const Value = (props: ValueProps) => {
  const classes = useStyles()
  return (
    <TableCell className={classes.col2}>
      <Typography className={classes.col2Text}>
        <FormattedValue {...props} />
      </Typography>
    </TableCell>
  )
}

type Props = {|
  tags?: JSONObject,
  editMode?: boolean,
  fields?: Array<Field>,
  onChange?: (newTags: {}) => any,
  width?: number
|}

const DetailsTable = ({ fields = [], tags = {}, width }: Props) => {
  const classes = useStyles()

  function renderTable(width) {
    return (
      <Table className={classes.root} style={{ width: width }} size="small">
        <TableBody>
          {fields
            .map((field, i) => {
              const value: Primitive | Array<Primitive> = get(tags, field.key)
              if (isEmptyValue(value)) return null
              return (
                <TableRow
                  key={i}
                  className={classes.row}
                  style={{ zIndex: fields.length - i }}>
                  <Label field={field} style={{ maxWidth: width / 3 - 36 }} />
                  <Value value={value} field={field} />
                </TableRow>
              )
            })
            .filter(Boolean)}
        </TableBody>
      </Table>
    )
  }

  if (typeof width === 'number') return renderTable(width)
  return (
    <AutoSizer disableHeight>
      {({ width }) => {
        return renderTable(width)
      }}
    </AutoSizer>
  )
}

function isEmptyValue(value) {
  return (
    (typeof value === 'string' && value.length === 0) ||
    value === undefined ||
    value === null
  )
}

export default DetailsTable
