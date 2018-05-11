import React from 'react'

export default class ShareView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      sharing: false
    }
  }

  render () {
    return (
      <div>
        'sharing data'
      </div>
    )
  }
}
