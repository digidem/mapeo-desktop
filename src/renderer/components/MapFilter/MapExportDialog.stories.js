import React from 'react'
import { action } from '@storybook/addon-actions'

import MapExportDialog from './MapExportDialog'

export default {
  title: 'Map Export'
}

const testObs = [
  {
    lon: -76.2040014,
    lat: -0.1983257,
    attachments: [
      {
        id: '4abe1a942e0a5cd5846d4dcb6f96ce2d.jpg',
        type: 'image/jpeg'
      }
    ],
    tags: {
      categoryId: 'asentamiento-ilegal',
      notes:
        'Invasión,sembrios de cacao está hectárea 2 tiene aproximadamente  de los invasores'
    },
    metadata: {
      location: {
        error: false,
        permission: 'granted',
        provider: {
          gpsAvailable: true,
          passiveAvailable: true,
          locationServicesEnabled: true,
          networkAvailable: true
        },
        position: {
          timestamp: 1560894283000,
          mocked: false,
          coords: {
            altitude: 241.2,
            heading: 282,
            longitude: -76.2040014,
            speed: 0,
            latitude: -0.1983257,
            accuracy: 3
          }
        }
      }
    },
    schemaVersion: 3,
    type: 'observation',
    timestamp: '2019-10-02T19:21:44.211Z',
    created_at: '2019-06-18T21:46:45.703Z',
    id: '002346c8a8921f5c',
    links: [
      '08764aa2dbfd49f42f879950d364c8c28d2e6374de48d9982281ffc88dfb7223@0'
    ],
    version:
      '08764aa2dbfd49f42f879950d364c8c28d2e6374de48d9982281ffc88dfb7223@1'
  },
  {
    lon: -76.1821115,
    lat: -0.2078845,
    attachments: [
      {
        id: '05d48eb4b7f6de9f3d801f4c875c8c74.jpg',
        type: 'image/jpeg'
      },
      {
        id: 'c511570a32c64881730db16f8a3e16d0.jpg',
        type: 'image/jpeg'
      },
      {
        id: '99e44ee66b4d8528753d45a3bd7f8f09.jpg',
        type: 'image/jpeg'
      }
    ],
    tags: {
      categoryId: 'tala-ilegal',
      notes:
        'Amarillo canelo talado de más o menos 30 metros y de unos 30 @ños de vida.... 😭 Para vender son tablones más o menos 200 \nTerrible '
    },
    metadata: {
      location: {
        error: false,
        permission: 'granted',
        provider: {
          backgroundModeEnabled: true,
          gpsAvailable: true,
          passiveAvailable: true,
          locationServicesEnabled: true,
          networkAvailable: true
        },
        position: {
          timestamp: 1562097313000,
          mocked: false,
          coords: {
            altitude: 218.7,
            heading: 269,
            longitude: -76.1821115,
            speed: 0.5677385926246643,
            latitude: -0.2078845,
            accuracy: 3
          }
        }
      }
    },
    schemaVersion: 3,
    type: 'observation',
    timestamp: '2019-07-02T19:59:34.359Z',
    created_at: '2019-07-02T19:56:48.373Z',
    id: '00e45c12cb026d67',
    links: [
      '9dd59c141187453d6232c0600ea577b7e09dbb20a42a8c463057bb1f7c20ea54@86'
    ],
    version:
      '9dd59c141187453d6232c0600ea577b7e09dbb20a42a8c463057bb1f7c20ea54@87'
  },
  {
    lon: -76.0480426,
    lat: 0.0957959,
    attachments: [
      {
        id: 'cbbb8569d886a4a8e0f0a2c22512c53b.jpg',
        type: 'image/jpeg'
      }
    ],
    tags: {
      categoryId: 'tala-ilegal',
      notes: 'Guabillo tumbado directo sobre el lindero hace un mes'
    },
    metadata: {
      location: {
        error: false,
        permission: 'granted',
        provider: {
          backgroundModeEnabled: true,
          gpsAvailable: true,
          passiveAvailable: true,
          locationServicesEnabled: true,
          networkAvailable: true
        },
        position: {
          timestamp: 1563312915000,
          mocked: false,
          coords: {
            altitude: 250.3,
            heading: 264,
            longitude: -76.0480426,
            speed: 0,
            latitude: 0.0957959,
            accuracy: 3
          }
        }
      }
    },
    schemaVersion: 3,
    type: 'observation',
    timestamp: '2019-07-16T21:36:11.035Z',
    created_at: '2019-07-16T21:36:11.035Z',
    id: '01227dae92589572',
    links: [],
    version:
      '9dd59c141187453d6232c0600ea577b7e09dbb20a42a8c463057bb1f7c20ea54@109'
  },
  {
    lon: -76.1001875,
    lat: 0.0897293,
    attachments: [
      {
        id: 'b937221a693ab0dd5369110c24e206ff.jpg',
        type: 'image/jpeg'
      },
      {
        id: '760b2e0006efb14e9e76308b6031e562.jpg',
        type: 'image/jpeg'
      }
    ],
    tags: {
      categoryId: 'sendero-cazadores',
      notes: 'Cruze del lindero de Tase'
    },
    metadata: {
      location: {
        error: false,
        permission: 'granted',
        provider: {
          backgroundModeEnabled: true,
          gpsAvailable: true,
          passiveAvailable: true,
          locationServicesEnabled: true,
          networkAvailable: true
        },
        position: {
          timestamp: 1563388482000,
          mocked: false,
          coords: {
            altitude: 242.1,
            heading: 8,
            longitude: -76.1001875,
            speed: 0.273832231760025,
            latitude: 0.0897293,
            accuracy: 3
          }
        }
      }
    },
    schemaVersion: 3,
    type: 'observation',
    timestamp: '2019-07-17T18:35:18.640Z',
    created_at: '2019-07-17T18:35:18.640Z',
    id: '016de602f27dde8b',
    links: [],
    version:
      '9dd59c141187453d6232c0600ea577b7e09dbb20a42a8c463057bb1f7c20ea54@136'
  }
]

const getMediaUrl = id => `http://127.0.0.1:5000/media/preview/${id}`

export const defaultStory = () => (
  <MapExportDialog
    open
    onClose={action('close')}
    getMediaUrl={getMediaUrl}
    observations={testObs}
  />
)
