const NetworkSpeed = require('network-speed')

async function download () {
  const fileSizeInBytes = 100000
  const baseUrl = 'https://downloads.mapeo.app/100000.txt'
  const networkSpeed = new NetworkSpeed()
  const speed = await networkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes)
  speed.bps = parseInt(Math.round(speed.bps))
  return speed
}

async function upload (fileSizeInBytes) {
  throw new Error('Not Implemented')
}

module.exports = {
  download, upload
}
