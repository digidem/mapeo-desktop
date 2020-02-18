import { remote } from 'electron'

import Api from './mapeo-client'

const BASE_URL = 'http://' + remote.getGlobal('osmServerHost') + '/'

export default Api({
  // window.middlewareClient is set in src/middleware/client-preload.js
  ipc: window.middlewareClient,
  baseUrl: BASE_URL
})
