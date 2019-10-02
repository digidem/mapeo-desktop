import React from 'react'
import styled from 'styled-components'

const Styled = styled.div`
  display: inline-block;
  position: relative;
  width: 64px;
  height: 64px;
  div {
    position: absolute;
    top: 12px;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  div:nth-child(1) {
    left: 6px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  div:nth-child(2) {
    left: 6px;
    animation: lds-ellipsis2 0.6s infinite;
    background-color: rgba(0, 5, 43, 1);
  }
  div:nth-child(3) {
    left: 26px;
    background-color: rgba(0, 5, 43, 1);
    animation: lds-ellipsis2 0.6s infinite;
  }
  div:nth-child(4) {
    left: 45px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0);
      background-color: rgba(0, 5, 43, 0);
    }
    100% {
      transform: scale(1);
      background-color: rgba(0, 5, 43, 1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1);
      background-color: rgba(0, 5, 43, 1);
    }
    100% {
      transform: scale(0);
      background-color: rgba(0, 5, 43, 0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(19px, 0);
    }
  }
`

const Loader = () => (
  <Styled>
    <div />
    <div />
    <div />
    <div />
  </Styled>
)

export default Loader
