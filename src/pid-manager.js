const path = require('path')
const fs = require('fs')
const terminate = require('terminate')
const { fork } = require('child_process')
const events = require('events')

const logger = require('./logger')

class Worker extends events.EventEmitter {
  constructor (userDataPath) {
    super()
    this.userDataPath = userDataPath
    this.loc = path.join(userDataPath, 'pid')
    this.process = null
  }

  create ({socketName, filepath}, cb) {
    logger.debug('Creating subprocess', socketName, filepath)
    this.cleanup((err) => {
      if (err) logger.debug('Not fatal', err)
      logger.debug('Starting background process')
      this.process = fork(filepath, [
        '--subprocess',
        socketName,
        this.userDataPath
      ])

      this.process.on('error', (err) => {
        if (this.process) this.emit('close', err)
        this.process = null
      })
      this.process.on('exit', (code) => {
        if (this.process) this.emit('close', null, code)
        this.process = null
      })
      return cb(null, process)
    })
  }

  _remove (cb) {
    return fs.unlink(this.loc, cb)
  }

  _exists () {
    return fs.existsSync(this.loc)
  }

  pid (cb) {
    // Write the current pid of this process to the pid file.
    var done = () => {
      logger.debug('writing pid', process.pid)
      fs.writeFile(this.loc, process.pid.toString(), cb)
    }
    if (this._exists()) this.cleanup(done)
    else done()
  }

  read () {
    return parseInt(fs.readFileSync(this.loc).toString())
  }

  cleanup (cb) {
    if (this.process) this.process.kill()
    this.process = null
    if (!this._exists()) return cb(new Error('Nothing to clean up!'))
    var pid = this.read()
    logger.info('Terminating PID', pid)
    terminate(pid, (err) => {
      if (err) logger.error(err)
      if (err && err.code !== 'ESRCH') return cb(err)
      this._remove(cb)
    })
  }
}

module.exports = Worker
