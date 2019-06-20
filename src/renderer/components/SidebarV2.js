import React from 'react'
import styled from 'styled-components'

import MenuItems from './MenuItems'

const Main = styled.div`
  padding: 2vw;
  padding-top: 5vw;
  width: 15vw;
  flex: 1;
  background-color: purple;
`

export default class SidebarV2 extends React.Component {
  onSidebarClick (view) {
    if (view.modal) return this.props.openModal(view.name)
    this.props.changeView(view.name)
  }

  render () {
    return (
      <Main>
        <ul id='the-menu'>
          {MenuItems.map((view, i) => {
            var id = `menu-option-${view.name}`
            return (
              <li
                id={id}
                key={i}
                onClick={this.onSidebarClick.bind(this, view)}>
                {view.label}
              </li>)
          })}
        </ul>
      </Main>
    )
  }
}
