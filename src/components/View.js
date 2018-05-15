import styled from 'styled-components'

var View = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: var(--main-bg-color);
  color: white;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  h1, h2 {
    color: white;
    font-weight: bold;
  }
  img {
    width: 150px;
  }
`

export default View
