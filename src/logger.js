const winston = require('winston')
const path = require('path')
const DailyRotateFile = require('winston-daily-rotate-file')
const util = require('util')
const { format } = require('date-fns')
const isDev = require('electron-is-dev')

const store = require('./store')
const appVersion = require('../package.json').version

let Bugsnag

const BUGSNAG_API_KEY = 'fcd92279c11ac971b4bd29b646ec4125'

class Logger {
  constructor () {
    this.winston = winston.createLogger()
    this.configured = false
    this._messageQueue = []
    this._debug = store.get('debugging')
  }

  configure ({ userDataPath, label }) {
    this._startBugsnag(isDev ? 'development' : 'production')
    const prettyPrint = winston.format.printf(
      ({ level, message, label, timestamp }) => {
        return `${timestamp} [${label}] ${level}: ${message}`
      }
    )

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

    const mainLog = new DailyRotateFile({
      filename: '%DATE%.log',
      dirname: this.dirname,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '365d',
      level: 'info'
    })
    mainLog.name = 'main'
    this.winston.add(mainLog)

    const errorTransport = new DailyRotateFile({
      filename: '%DATE%.error.log',
      dirname: this.dirname,
      datePattern: 'YYYY-MM',
      zippedArchive: true,
      maxFiles: '365d',
      level: 'error'
    })
    this.winston.add(errorTransport)

    if (isDev) {
      this.winston.add(
        new winston.transports.Console({
          level: 'debug'
        })
      )
    }
    this.configured = true
    if (this._messageQueue.length > 0) this._drainQueue()
  }

  get errorFilename () {
    return path.join(this.dirname, format(Date.now(), 'yyyy-MM') + '.error.log')
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
      var msg = this._messageQueue.pop()
      this._log(msg.level, msg.args)
    }
  }

  _log (level, args) {
    if (!this.configured) this._messageQueue.push({ level, args })
    else {
      this.winston.log({
        level,
        message: util.format(...args)
      })
      if (level === 'error') {
        Bugsnag.notify(args[1], event => {
          event.context = args[0]
        })
      }
    }
  }

  warn () {
    this._log('warn', Array.from(arguments))
  }

  error (context, err) {
    if (!err) err = context
    this._log('error', [context, err])
  }

  info () {
    this._log('info', Array.from(arguments))
  }

  debug () {
    this._log('debug', Array.from(arguments))
  }

  _startBugsnag (releaseStage) {
    // This is really hacky because the @bugsnag/js package
    // does not properly handle an electron background
    // window with nodeIntegration: true
    const args = {
      releaseStage,
      apiKey: BUGSNAG_API_KEY,
      appVersion,
      enabledReleaseStages: ['production']
    }

    setTimeout(function () {}).__proto__.unref = function () {}
    try {
      Bugsnag = require('@bugsnag/node')
      Bugsnag.start(args)
    } catch (err) {
      logger.error('Failed to load bugsnag!', err)
      Bugsnag = require('@bugsnag/browser')
      Bugsnag.start(args)
    }
  }
}

const logger = new Logger()

module.exports = logger
