const path = require('path')
const fs = require('fs')
const terminate = require('terminate')
const { fork } = require('child_process')

const logger = require('./logger')

class Worker {
  constructor (userDataPath) {
    this.userDataPath = userDataPath
    this.loc = path.join(userDataPath, 'pid')
  }

  start (socketName, cb) {
    this.cleanup((err) => {
      if (err) throw err
      logger.debug('Starting background process')
      this.process = fork(path.join(__dirname, 'background', 'index.js'), [
        '--subprocess',
        socketName,
        this.userDataPath
      ])
      return cb(null, this.process)
    })
  }

  _remove (cb) {
    return fs.unlink(this.loc, cb)
  }

  _exists () {
    return fs.existsSync(this.loc)
  }

  pid (cb) {
    var done = () => {
      logger.info('writing pid', process.pid)
      fs.writeFile(this.loc, process.pid.toString(), cb)
    }
    if (this._exists()) this.cleanup(done)
    else done()
  }

  read () {
    return parseInt(fs.readFileSync(this.loc).toString())
  }

  cleanup (cb) {
    if (this.serverProcess) this.serverProcess.kill()
    this.serverProcess = null
    if (!this._exists()) {
      logger.error('No PID file found.')
      return cb()
    }
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
