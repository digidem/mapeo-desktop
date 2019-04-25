import styled from 'styled-components'
import React from 'react'

var ProgressBarWrapper = styled.div`
  z-index: var(--visible-z-index);
  padding: 15px;
  background-color: var(--main-bg-color);
  color: white;
  .progress {
    background-color: #9e9e9e !important;
  }
  .bar {
    background-color: #f1f1f1 !important;
  }
`

export default function ProgressBar (props) {
  var { title, index, total } = props
  if (!title) return null
  var style = {
    height: '24px',
    width: `${Math.round((index / total) * 100)}%`
  }
  return (
    <ProgressBarWrapper>
      {title}
      <div className='bar'>
        <div className='progress' style={style} />
      </div>
    </ProgressBarWrapper>
  )
}
