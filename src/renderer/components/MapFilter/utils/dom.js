const PPI = getPPI()

export function inch () {
  return PPI
}

export function cm () {
  return PPI / 2.54
}

// We use CSS units of `in` and `cm` for print views, but we want the values in
// pixels for the screen. PPI is normally 96, but just in case we measure it
// once on page load.
function getPPI () {
  const div = document.createElement('div')
  div.style.width = '1in'
  div.style.position = 'absolute'
  div.style.visibility = 'hidden'
  document.body.appendChild(div)
  const rect = div.getBoundingClientRect()
  document.body.removeChild(div)
  return rect.width
}
