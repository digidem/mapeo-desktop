import React from 'react'
import styled from 'styled-components'

import MenuItems from './MenuItems'

const Main = styled.div`
  padding-top: 5vw;
  width: 30vw;
  flex: 1;
  background-color: #000033;
  color: white;
`

const Logo = styled.h1`
  font-size: 2em;
  font-weight: 700;
`

export default class SidebarV2 extends React.Component {
  onSidebarClick (view) {
    if (view.modal) return this.props.openModal(view.name)
    this.props.changeView(view.name)
  }

  render () {
    return (
      <Main>
        <Logo>
          Mapeo
        </Logo>
        <ul id='the-menu'>
          {MenuItems.map((view, i) => {
            var id = `menu-option-${view.name}`
            return (
              <li
                id={id}
                class='menu-item'
                key={i}
                onClick={this.onSidebarClick.bind(this, view)}>
                <img src={`static/${view.icon}`} className='menu-item-icon' />
                {view.label}
              </li>)
          })}
        </ul>
      </Main>
    )
  }
}
