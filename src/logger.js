const winston = require('winston')
const path = require('path')
const DailyRotateFile = require('winston-daily-rotate-file')
const store = require('./store')
const util = require('util')

class Logger {
  constructor () {
    this.winston = winston.createLogger()
    this.configured = false
    this._messageQueue = []
    this._debug = store.get('debugging')
  }

  configure ({
    userDataPath,
    isDev,
    label
  }) {
    this.isDev = isDev
    const prettyPrint = winston.format.printf(({ level, message, label, timestamp }) => {
      return `${timestamp} [${label}] ${level}: ${message}`
    })

    this.winston.format = winston.format.combine(
      winston.format.label({ label }),
      winston.format.timestamp(),
      prettyPrint
    )
    this.dirname = path.join(userDataPath, 'logs')

    for (const transport of this.winston.transports) {
      if (transport.close) {
        transport.close()
      }
    }

    const mainLog = new (DailyRotateFile)({
      filename: '%DATE%.log',
      dirname: this.dirname,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '365d',
      level: 'info'
    })
    mainLog.name = 'main'
    mainLog.on('new', () => {
      // if debugging is on and a new log file is created, turn it off
      this.debugging(false)
    })
    mainLog.on('rotate', () => {
      // if debugging is on during a rotate, turn it off
      this.debugging(false)
    })
    this.winston.add(mainLog)

    const errorTransport = new (DailyRotateFile)({
      filename: '%DATE%.error.log',
      dirname: this.dirname,
      datePattern: 'YYYY-MM',
      zippedArchive: true,
      maxFiles: '365d',
      level: 'error'
    })
    this.winston.add(errorTransport)

    if (isDev) {
      this.winston.add(new winston.transports.Console({
        level: 'debug'
      }))
    }
    this.configured = true
    if (this._messageQueue.length > 0) this._drainQueue()
  }

  debugging (debug) {
    this._level(debug ? 'debug' : 'info')
    store.set('debugging', debug)
    this._debug = debug
  }

  _level (level) {
    var port = this.winston.transports.find(t => t.name === 'main')
    if (port) port.level = level
    else this.error('logger', new Error('Could not find transport main'))
  }

  configured () {
    return this.configured
  }

  _drainQueue () {
    while (this._messageQueue.length) {
      var args = this._messageQueue.pop()
      this.winston.log(args)
    }
  }

  _log (level, raw) {
    var args = {
      level,
      message: util.format(...Array.from(raw))
    }
    if (!this.configured) this._messageQueue.push(args)
    else {
      this.winston.log(args)
    }
  }

  warn () {
    this._log('warn', arguments)
  }

  error () {
    this._log('error', arguments)
  }

  info () {
    this._log('info', arguments)
  }

  debug () {
    this._log('debug', arguments)
  }
}

const logger = new Logger()

// This is really hacky because the @bugsnag/js package
// does not properly handle an electorn background
// window with nodeIntegration: true
try {
  const Bugsnag = require('@bugsnag/node')
  Bugsnag.start({
    apiKey: '572d472ea9d5a9199777b88ef268da4e',
    appVersion: require('../package.json').version,
    logger
  })
} catch (err) {
  const Bugsnag = require('@bugsnag/browser')
  Bugsnag.start({
    apiKey: '572d472ea9d5a9199777b88ef268da4e',
    appVersion: require('../package.json').version,
    logger
  })
}

module.exports = logger
