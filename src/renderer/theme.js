import { createMuiTheme } from '@material-ui/core/styles'

const systemFontFamily = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"'
].join(',')

export default createMuiTheme({
  typography: {
    fontFamily: 'Rubik, sans-serif',
    body1: {
      fontFamily: systemFontFamily
    },
    body2: {
      fontFamily: systemFontFamily
    },
    caption: {
      fontFamily: systemFontFamily
    }
  },
  palette: {
    primary: {
      main: '#0066FF'
    },
    secondary: {
      main: '#FF9933'
    }
  }
})
