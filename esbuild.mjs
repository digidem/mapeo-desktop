#!/usr/bin/env node

// @ts-check
import fs from 'node:fs'
import path from 'node:path'
import { promisify, parseArgs } from 'node:util'
import rimraf from 'rimraf'
import * as esbuild from 'esbuild'

const VALID_COMMANDS = ['build', 'watch', 'clean']
const VALID_MODES = ['dev', 'prod']
const OUTPUT_DIR = 'static'

// Changes based on Electron version
// See https://releases.electronjs.org/releases/stable
const CHROME_VERSION = 108

/**
 * @type {import('esbuild').Plugin}
 */
const copyNodeModulesAssetsPlugin = {
  name: 'copy-node-modules-assets',
  setup (build) {
    const { outdir } = build.initialOptions

    if (!outdir) {
      console.warn(
        'copy-node-modules-assets failed to run. no `outdir` defined'
      )
      return
    }

    // TODO: Consider moving iD + Mapbox CSS assets to static/css
    // Would need to update builder.config.js

    // fs.copyFileSync(
    //   path.resolve('node_modules/id-mapeo/dist/iD.css'),
    //   path.join(outdir, 'css/id-mapeo.css')
    // )
    // fs.copyFileSync(
    //   path.resolve('node_modules/mapbox-gl/dist/mapbox-gl.css'),
    //   path.join(outdir, 'css/mapbox-gl.css')
    // )

    // https://github.com/wojtekmaj/react-pdf#standard-browserify-esbuild-and-others
    fs.copyFileSync(
      path.resolve('node_modules/pdfjs-dist/build/pdf.worker.js'),
      path.join(outdir, 'pdf.worker.js')
    )

    console.log('copy-node-modules-assets ran successfully!')
  }
}

await runCommand(extractArgs())

/* ------------------------------------------------------- */

/**
 * @returns {{command: 'build'|'watch'|'clean', mode: 'dev'|'mode'}}
 */
function extractArgs () {
  const { values, positionals } = parseArgs({
    options: {
      mode: {
        type: 'string',
        short: 'm'
      }
    },
    allowPositionals: true
  })

  const command = positionals[0]
  const mode = values.mode || 'dev'

  if (!VALID_COMMANDS.includes(command)) {
    const message =
      (command
        ? `Invalid command '${command}' specified.`
        : `No command specified`) +
      `\nPlease use one of the following: ${VALID_COMMANDS.join(', ')}`

    console.error(message)

    process.exit(1)
  }

  if (!VALID_MODES.includes(mode)) {
    const message =
      `Invalid mode '${mode}' specified.` +
      `\nPlease use of of the following: ${VALID_MODES.join(', ')}`

    console.error(message)

    process.exit(1)
  }

  return {
    command,
    mode
  }
}

/**
 * @param {Object} opts
 * @param {'build'|'watch'|'clean'} opts.command
 * @param {'dev' | 'prod'} opts.mode
 */
async function runCommand (opts) {
  const buildOptions = createBuildOptions(opts.mode)

  switch (opts.command) {
    case 'clean': {
      await cleanBuildAssets()

      console.log(`Successfully cleaned ${buildOptions.outdir}`)

      break
    }
    case 'build': {
      await cleanBuildAssets()

      await esbuild.build(buildOptions)

      console.log('Successfully built!')

      break
    }
    case 'watch': {
      const ctx = await esbuild.context(buildOptions)

      await cleanBuildAssets()

      await ctx.watch()

      const { host, port } = await ctx.serve({
        host: 'localhost',
        servedir: '.'
      })

      console.log(`Listening at http://${host}:${port}`)

      break
    }
  }
}

/**
 * @param {'dev'|'prod'} mode
 * @returns {import('esbuild').BuildOptions}
 */
function createBuildOptions (mode) {
  return {
    entryPoints: [
      { in: 'src/renderer/app.js', out: 'app' },
      { in: 'src/renderer/components/MapFilter/index.js', out: 'map-filter' },
      { in: 'src/renderer/components/MapEditor/index.js', out: 'map-editor' },
      {
        in: 'src/renderer/components/MapFilter/ReportView/renderReport.worker.js',
        out: 'reportWorker'
      }
    ],
    entryNames: '[name].bundle',
    chunkNames: '[name]-[hash].chunk',
    outdir: OUTPUT_DIR,
    // Think Electron disables ESM but this should be okay, I think
    // https://github.com/electron/electron/issues/21457
    format: 'esm',
    splitting: true,
    minify: mode === 'prod',
    bundle: true,
    target: `chrome${CHROME_VERSION}`,
    plugins: [copyNodeModulesAssetsPlugin],
    loader: {
      '.js': 'jsx',
      '.svg': 'file',
      '.ttf': 'file'
    },
    // Anything specified here has to use `require` to import in renderer app code
    external: [
      'electron',
      'process',
      'path',
      'https',
      'fs',
      'child_process',
      'os',
      'crypto',
      'stream',
      'constants',
      'http',
      'domain',
      'zlib',
      'timers'
    ]
  }
}

async function cleanBuildAssets () {
  return promisify(rimraf)(`./${OUTPUT_DIR}/*.{bundle,chunk}.{js,css}`)
}
