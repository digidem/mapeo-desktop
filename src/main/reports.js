var React = require('react')
var { FormattedTime, IntlProvider } = require('react-intl')
var {
  Page,
  Text,
  View,
  Image,
  Document,
  StyleSheet
} = require('@react-pdf/renderer')

var { isEmptyValue } = require('../renderer/components/MapFilter/utils/helpers')
var { get } = require('../renderer/components/MapFilter/utils/get_set')
var FormattedFieldname = require('../renderer/components/MapFilter/internal/FormattedFieldname')
var FormattedValue = require('../renderer/components/MapFilter/internal/FormattedValue')
var FormattedLocation = require('../renderer/components/MapFilter/internal/FormattedLocation')

var crypto = require('crypto')

const PdfContext = React.createContext(false)

class Report {
  constructor (observations) {
    this.id = crypto.randomBytes(32)
    this.pdf = this._createPDF(observations)
  }

  _createPDF (observations) {
    return (<PdfContext.Provider value={true}>
      <IntlProvider>
        <Document>
          {observations.map(observation => (
            <FeaturePage
              key={observation.id}
              observation={observation}
              preset={observation.preset}
            />
          ))}
        </Document>
      </IntlProvider>
    </PdfContext.Provider>)
  }
}

const FeaturePage = (observation, preset) => {
  const coords =
    typeof observation.lon === 'number' && typeof observation.lat === 'number'
      ? {
          longitude: observation.lon,
          latitude: observation.lat
        }
      : undefined
  const createdAt =
    typeof observation.created_at === 'string'
      ? new Date(observation.created_at)
      : undefined
  const fields = preset.fields.concat(preset.additionalFields)
  const tags = observation.tags || {}
  const note = tags.note || tags.notes
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed></View>
      <View style={styles.pageContent}>
        <View style={styles.columnLeft}>
          <Text style={styles.presetName}>{preset.name || 'Observation'}</Text>
          {createdAt && (
            <Text style={styles.createdAt}>
              <Text style={styles.createdAtLabel}>Registrado: </Text>
              <FormattedTime
                key="time"
                value={createdAt}
                year="numeric"
                month="long"
                day="2-digit"
              />
            </Text>
          )}
          {coords && (
            <Text style={styles.location}>
              <Text style={styles.locationLabel}>Ubicación: </Text>
              <FormattedLocation {...coords} />
            </Text>
          )}
          {note &&
            note.split('\n').map((para, idx) => (
              <Text key={idx} style={styles.description}>
                {para}
              </Text>
            ))}
          <Text style={styles.details}>Detalles</Text>
          {fields.map(field => {
            const value = get(tags, field.key)
            if (isEmptyValue(value)) return null
            return (
              <View key={field.id} style={styles.field} wrap={false}>
                <Text style={styles.fieldLabel}>
                  <FormattedFieldname field={field} />
                </Text>
                <Text style={styles.fieldValue}>
                  <FormattedValue field={field} value={value} />
                </Text>
              </View>
            )
          })}
        </View>
        <View style={styles.columnRight}>
          {observation.attachments && observation.attachments.slice(0, 4).map((att, i) => {
            return att.media && <Image
              src={att.media.src}
              key={i}
              style={styles.image}
              wrap={false}
            />
          }
          )}
        </View>
      </View>
      <View style={styles.footer} fixed />
    </Page>
  )
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    paddingTop: 120,
    paddingBottom: 35,
    paddingHorizontal: 35,
    flexDirection: 'row'
  },
  pageContent: {
    flex: 1,
    flexDirection: 'row',
    fontFamily: 'SourceSansPro'
  },
  columnLeft: {
    flex: 2,
    paddingRight: 12,
    lineHeight: 1.2
  },
  columnRight: {
    // backgroundColor: 'aqua',
    flex: 1
  },
  presetName: {
    fontWeight: 700
  },
  createdAt: {
    fontSize: 12
  },
  createdAtLabel: {
    fontSize: 12,
    color: 'grey'
  },
  location: {
    fontSize: 12,
    marginBottom: 6
  },
  locationLabel: {
    fontSize: 12,
    color: 'grey'
  },
  map: {
    height: '60mm',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 12,
    backgroundColor: '#8E918B'
  },
  image: {
    height: '40mm',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
    backgroundColor: '#C8D8E3'
  },
  description: {
    marginBottom: 6,
    fontSize: 12
  },
  details: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 3,
    marginTop: 12
  },
  field: {
    marginBottom: 6
  },
  fieldLabel: {
    fontSize: 9,
    marginBottom: 1,
    color: '#333333'
  },
  fieldValue: {
    fontSize: 12
  },
  header: {
  },
  footer: {
  }

})

module.exports = Report

