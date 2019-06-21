import React from 'react'
import styled from 'styled-components'

import MenuItems from './MenuItems'

const Main = styled.div`
  padding-top: 3em;
  width: 15em;
  background-color: #000033;
  color: white;
`

const Logo = styled.h1`
  font-family: 'Rubik', sans-serif;
  font-weight: 500;
  font-size: 2em;
  padding: 0 1.5em;
  margin-bottom: 0.5em;
`

const MenuItem = styled.li`
  font-family: 'Rubik', sans-serif;
  font-weight: 400;
  font-size: 1em;
  padding: 0.75em 1.5em;
  :hover {
    background-color: #33335C;
  }
  img {
    width: 14px;
    margin-right: 1em;
  }
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
        <ul>
          {MenuItems.map((view, i) => {
            var id = `menu-option-${view.name}`
            return (
              <MenuItem
                id={id}
                key={i}
                onClick={this.onSidebarClick.bind(this, view)}>
                <img src={`static/${view.icon}`} />
                {view.label}
              </MenuItem>)
          })}
        </ul>
      </Main>
    )
  }
}
