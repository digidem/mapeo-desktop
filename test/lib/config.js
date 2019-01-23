const path = require('path')

const TEMP_DIR = process.platform === 'win32' ? 'C:\\Windows\\Temp' : '/tmp'
const TEST_DIR = path.join(TEMP_DIR, 'MapeoTest')
const TEST_DIR_DOWNLOAD = path.join(TEST_DIR, 'Downloads')
const TEST_DIR_MAPEO = path.join(TEST_DIR, 'Mapeo')
const TEST_DIR_MOCK_DEVICE = path.join(TEST_DIR, 'MockDevice')

module.exports = {
  TEST_DIR,
  TEST_DIR_DOWNLOAD,
  TEST_DIR_MAPEO,
  TEST_DIR_MOCK_DEVICE
}
