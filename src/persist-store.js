const Store = require('electron-store')

const schema = {
  'experiments-flags': {
    type: 'object',
    properties: {
      state: {
        type: 'object',
        properties: {
          backgroundMaps: { type: 'boolean' },
          storeVersion: { type: 'string' }
        }
      },
      version: { type: 'number' }
    }
  },
  'background-maps': {
    type: 'object',
    properties: {
      state: {
        type: 'object',
        properties: {
          mapStyle: { type: 'string' },
          storeVersion: { type: 'string' }
        }
      },
      version: { type: 'number' }
    }
  },
  ui: {
    type: 'object',
    properties: {
      state: {
        type: 'object',
        properties: {
          tabIndex: { type: 'number' }
        }
      },
      version: { type: 'number' }
    }
  },
  state: {
    type: 'object',
    properties: {
      maximize: { type: 'boolean' },
      fullscreen: { type: 'boolean' },
      defaultWidth: { type: 'number' },
      defaultHeight: { type: 'number' },
      isMaximized: true,
      show: { type: 'boolean' },
      x: { type: 'number' },
      y: { type: 'number' },
      width: { type: 'number' },
      height: { type: 'number' },
      isFullScreen: { type: 'boolean' },
      displayBounds: {
        type: 'object',
        properties: {
          x: { type: 'number' },
          y: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' }
        }
      }
    }
  }
}

const persistedStore = new Store({ schema })

module.exports = persistedStore
