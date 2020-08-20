// @flow
import * as React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import insertCss from 'insert-css'
import clsx from 'clsx'

const useStyles = makeStyles({
  container: {
    padding: 20,
    pageBreakAfter: 'always',
    position: 'relative',
    '@media only print': {
      padding: 0
    },
    '&:last-child': {
      pageBreakAfter: 'avoid !important'
    },
    boxSizing: 'border-box'
  },
  paper: {
    position: 'relative',
    overflow: 'hidden',
    // backgroundColor: 'rgb(245,245,245)',
    '@media only print': {
      boxShadow: 'none !important',
      borderRadius: '0 !important',
      margin: 0,
      overflow: 'auto',
      '&:after': {
        display: 'none'
      }
    },
    '&:after': {
      // Hides the page-break <hr> if it appears within the bottom-margin
      content: "''",
      position: 'absolute',
      backgroundColor: 'rgb(255,255,255)',
      width: '100%',
      height: '0.5in',
      bottom: 0
    }
  },
  pageBreak: {
    position: 'absolute',
    left: 0,
    width: '100%',
    border: 'none',
    margin: 0,
    borderBottom: '3px dashed rgba(200,200,200, 0.75)',
    '@media only print': {
      display: 'none'
    }
  },
  content: {
    position: 'relative',
    margin: '0.5in',
    backgroundColor: 'white',
    '@media only print': {
      margin: 0,
      outline: 'none'
    }
  },
  letter: {
    '&$paper': {
      minWidth: '8.5in',
      maxWidth: '8.5in',
      '@media only print': {
        /* for some reason we need to substract 2px for a perfect fit */
        width: 'calc(8.5in - 1in - 2px)',
        minWidth: 'calc(8.5in - 1in - 2px)',
        maxWidth: 'calc(8.5in - 1in - 2px)'
      }
    },
    '& $pageBreak': {
      top: '10.5in'
    },
    '&$content': {
      minHeight: '10in',
      '@media only print': {
        minHeight: 'calc(11in - 1in - 2px)'
      }
    }
  },
  a4: {
    '&$paper': {
      minWidth: '210mm',
      maxWidth: '210mm',
      '@media only print': {
        /* for some reason we need to substract 2px for a perfect fit */
        width: 'calc(210mm - 1in - 2px)',
        minWidth: 'calc(210mm - 1in - 2px)',
        maxWidth: 'calc(210mm - 1in - 2px)'
      }
    },
    '& $pageBreak': {
      top: 'calc(297mm - 0.5in)'
    },
    '&$content': {
      minHeight: 'calc(297mm - 1in)',
      '@media only print': {
        minHeight: 'calc(297mm - 1in - 2px)'
      }
    }
  },
  '@global': {
    '@media only print': {
      body: {
        margin: 0,
        padding: 0
      }
    }
  }
})

type Props = {
  // Called when page is clicked
  onClick?: (event: SyntheticMouseEvent<HTMLElement>) => void,
  paperSize: 'a4' | 'letter',
  children: React.Node,
  style?: Object,
  classes?: Object
}

const ReportPaper = ({
  onClick,
  paperSize,
  children,
  style,
  classes = {}
}: Props) => {
  const cx = useStyles()
  // This is global to the app - we add this once for every time the paper size
  // changes, but only once. CSS header will grow, but should be ok unless the
  // user changes paper size hundreds of times without reloading the appp
  React.useMemo(() => insertCss(`@page {margin: 0.5in; size: ${paperSize};}`), [
    paperSize
  ])
  return (
    <div className={clsx(cx.container, classes.container)} style={style}>
      <Paper
        className={clsx(cx.paper, cx[paperSize], classes.paper)}
        style={onClick ? { cursor: 'pointer' } : null}
        onClick={onClick}
        elevation={1}
      >
        <div className={clsx(cx.content, cx[paperSize], classes.content)}>
          {children}
        </div>
        <hr className={cx.pageBreak} />
      </Paper>
    </div>
  )
}

export default ReportPaper
