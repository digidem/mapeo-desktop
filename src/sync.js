const React = require('react')
const h = React.createElement
const { Card, CardText, CardHeader } = require('material-ui/Card')
const { defineMessages, FormattedMessage } = require('react-intl')

const messages = defineMessages({
  syncData: {
    id: 'syncData.title',
    defaultMessage: 'Synchronize data with USB',
    description: 'Title for synchronize data dialog'
  }
})

const styles = {
  button: {
    marginLeft: 12,
    float: 'right'
  },
  body: {
    marginBottom: 12,
    minHeight: 200,
    display: 'flex'
  },
  card: {
    maxHeight: '100%',
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  cardContainerStyle: {
    flex: 1,
    flexDirection: 'column',
    display: 'flex'
  },
  cardText: {
    overflow: 'auto'
  }
}

class SyncData extends React.Component {
  render () {
    return h(Card, {
      style: styles.card,
      containerStyle: styles.cardContainerStyle,
      zDepth: 2
    }, [
      h(CardHeader, {
        style: styles.header,
        title: h('h3', {}, h(FormattedMessage, messages.syncData))
      }),
      h(CardText, {style: styles.cardText}, 'Hello World')
    ])
  }
}

module.exports = SyncData
