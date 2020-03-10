import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import Select from './Select'

const styleSheet = {
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: -3
  },
  chip: {
    margin: '3px 3px 0 0',
    height: 30
  },
  select: {
    minWidth: 220
  },
  highlight: {
    backgroundColor: '#ff9696'
  }
}

class MultiSelect extends Component {
  state = {
    selectValue: '',
    suggestions: this.props.suggestions.filter(
      s => this.props.value.indexOf(s) === -1
    )
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      const suggestions = nextProps.suggestions.filter(
        s => nextProps.value.indexOf(s) === -1
      )
      this.setState({ suggestions })
    }
  }

  handleSelectChange = (e, d) => {
    this.setState({ selectValue: d.newValue })
  }

  handleKeyDown = e => {
    if (this.justAdded || e.keyCode !== 13) {
      this.justAdded = false
      return
    }
    const newValue = this.state.selectValue
    const index = this.props.value.indexOf(newValue)
    if (index > -1) {
      this.highlightChip(index)
      this.setState({ selectValue: '' })
    } else {
      this.handleSuggestionSelected(e, { suggestionValue: newValue })
    }
  }

  handleSuggestionSelected = (e, d) => {
    const newValue = this.props.value.concat(d.suggestionValue)
    this.justAdded = true
    this.setState({ selectValue: '' })
    this.props.onChange(e, { newValue, type: 'add' })
  }

  handleRequestDelete = i => {
    return e => {
      const { value } = this.props
      const newValue = value.slice(0, i).concat(value.slice(i + 1))
      this.props.onChange(e, { newValue, type: 'delete' })
    }
  }

  highlightChip(i) {
    this.setState({ highlight: i })
    setTimeout(() => this.setState({ highlight: null }), 500)
  }

  render() {
    const { classes, value } = this.props
    return (
      <div className={classes.row}>
        {value.map((d, i) => (
          <Chip
            label={d}
            key={i}
            onRequestDelete={this.handleRequestDelete(i)}
            className={
              classes.chip +
              (this.state.highlight === i ? ' ' + classes.highlight : '')
            }
          />
        ))}
        <Select
          value={this.state.selectValue}
          suggestions={this.state.suggestions}
          onChange={this.handleSelectChange}
          onKeyDown={this.handleKeyDown}
          onSuggestionSelected={this.handleSuggestionSelected}
          className={classes.select}
        />
      </div>
    )
  }
}

MultiSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  value: PropTypes.array
}

MultiSelect.defaultProps = {
  value: []
}

export default withStyles(styleSheet)(MultiSelect)
