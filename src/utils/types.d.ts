type Handler = (...args: any[]) => Promise<any> | any

export type BackgroundProcess = {
  handlers: { [name: string]: Handler }
  start?: () => Promise<any>
  close?: () => Promise<void>
}

export type IpcRequest = { id: number; name: string; args: any }
export type IpcResponse = { id: number; type: 'reply' | 'error'; result: any }
export type IpcBroadcast = { name: string; type: 'push'; args: any }

export type MapeoCoreOptions = {
  datadir: string
  userDataPath: string
  mapeoServerPort: number
  tileServerPort: number
}

export type MapPrinterOptions = {
  mapPrinterPort: number
}
