const React = require('react')
const path = require('path')
const fs = require('fs')
const body = require('body/json')
const { app } = require('electron')
const { FormattedTime, IntlProvider } = require('react-intl')
const crypto = require('crypto')

const {
  render,
  Page,
  Text,
  View,
  Image,
  Document,
  StyleSheet
} = require('@react-pdf/renderer')

const { isEmptyValue } = require('../renderer/components/MapFilter/utils/helpers')
const { get } = require('../renderer/components/MapFilter/utils/get_set')
const FormattedFieldname = require('../renderer/components/MapFilter/internal/FormattedFieldname')
const FormattedValue = require('../renderer/components/MapFilter/internal/FormattedValue')
const FormattedLocation = require('../renderer/components/MapFilter/internal/FormattedLocation')

export const PdfContext = React.createContext(false)

export function middleware (req, res) {
  var match = req.url.match(/\/report\/(.*)/)
  if (match) {
    var id = match[1]
    var report = new Report(id)
    report.createReadStream().pipe(res)
    return true
  }

  if (req.url === '/report' && req.method === 'POST') {
    body(req, { limit: '50mb' }, function (err, body) {
      if (err) return res.end(JSON.stringify({ error: err.toString() }))
      const observations = body.observations
      console.log('getting request', observations.length, 'observations')
      console.log('observation example:', JSON.stringify(observations[0], null, 2))

      var report = new Report()
      report.create(observations)
      report.save()
      console.log('created report', report.id)
      res.end(JSON.stringify(report.id))
    })
    return true
  }
}

export class Report {
  constructor (id) {
    if (!id) this.id = crypto.randomBytes(16).toString('hex')
    const reportsDirectory = path.join(app.getPath('userData'), 'reports')
    this.filepath = path.join(reportsDirectory, id + '.pdf')
  }

  createReadStream () {
    return fs.createReadStream(this.filepath)
  }

  create (observations) {
    // TODO: to improve performance,
    // 1. generate hash based on observations content,
    // 2. use hashed id to check if PDF has already been created
    //  -> if so, use that
    //  -> if not, generate new
    this.observations = observations
    this.pdf = ReportPDF(this.observations)
    console.log('made a report')
  }

  save () {
    console.log('saving ', this.filepath)
    render(this.pdf, this.filepath)
  }
}

function ReportPDF (observations) {
  return (<PdfContext.Provider value={true}>
    <IntlProvider>
      <Document>
        {observations.map(observation => (
          <FeaturePage
            key={observation.id}
            observation={observation}
          />
        ))}
      </Document>
    </IntlProvider>
  </PdfContext.Provider>)
}

const FeaturePage = ({
  observation
}) => {
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

  const preset = observation.preset
  const fields = preset.fields.concat(preset.additionalFields)
  const tags = observation.tags || {}
  const note = tags.note || tags.notes

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed />
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
                  <FormattedFieldname field='test' />
                </Text>
                <Text style={styles.fieldValue}>
                  <FormattedValue field='test' value={value} />
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
    flexDirection: 'row'
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

