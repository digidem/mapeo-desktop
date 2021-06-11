// @ts-check

const path = require('path')
const { promises: fs } = require('fs')
const terminate = require('terminate')
const { app } = require('electron')

const logger = require('../logger')

/**
 * Check for existing orphaned processes and terminate them. Writes the current
 * pid to file so that this process can be cleaned up later if necessary
 *
 * @returns {Promise<void>}
 */
module.exports = async function cleanUpOrphanProcesses () {
  const pidFilepath = path.join(app.getPath('userData'), 'pid')

  /** @type {number | undefined} */
  let existingPid
  try {
    existingPid = parseInt((await fs.readFile(pidFilepath)).toString())
  } catch (e) {}

  const asyncTasks = [fs.writeFile(pidFilepath, process.pid.toString())]

  if (existingPid) {
    asyncTasks.push(terminatePromise(existingPid))
  }

  // Minimize wait, run async tasks in parallel
  await Promise.all(asyncTasks)

  // Not registering exit handlers for cleanup of the PID, since this could
  // cause race conditions. Better leave the PID file there, even if process
  // exists gracefully, and try and fail to terminate it on startup
}

/**
 * async terminate
 *
 * @param {number} pid
 * @returns {Promise<void>}
 */
async function terminatePromise (pid) {
  return new Promise((resolve, reject) => {
    terminate(pid, err => {
      if (err && err.code !== 'ESRCH') {
        // A problem terminating an orphaned process, but we can't do much about
        // it other than log the problem
        logger.error('pid-manager', err)
        resolve()
      } else {
        logger.debug('Cleaned up existing process pid:', pid)
        resolve()
      }
    })
  })
}
