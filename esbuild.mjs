#!/usr/bin/env node

// @ts-check
import path from 'path'
import fs from 'fs'
import * as esbuild from 'esbuild'

// Changes based on Electron version
// See https://releases.electronjs.org/releases/stable
const CHROME_VERSION = 108

const OUTPUT_DIR = 'static'

/**
 * @type {import('esbuild').BuildOptions}
 */
const options = {
  entryPoints: [
    { in: 'src/renderer/app.js', out: 'app' },
    { in: 'src/renderer/components/MapFilter/index.js', out: 'map-filter' },
    { in: 'src/renderer/components/MapEditor/index.js', out: 'map-editor' },
    {
      in: 'src/renderer/components/MapFilter/ReportView/renderReport.worker.js',
      out: 'pdfWorker'
    }
  ],
  entryNames: '[name].bundle',
  chunkNames: '[name]-[hash].chunk',
  // Ideally change to ESM but Electron disables ESM, I think
  // https://github.com/electron/electron/issues/21457
  // format: 'cjs',
  format: 'esm',
  splitting: true,
  // minify: true,
  outdir: OUTPUT_DIR,
  bundle: true,
  target: `chrome${CHROME_VERSION}`,
  // target: 'node16.17.1',
  loader: {
    '.js': 'jsx',
    '.png': 'file',
    '.svg': 'file',
    '.ttf': 'file'
  },
  define: {
    // TODO: This isn't working
    'window.IS_PRODUCTION': 'false'
  },
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

const [command] = process.argv.slice(2)

switch (command) {
  case 'build': {
    await esbuild.build(options)

    // https://github.com/wojtekmaj/react-pdf#standard-browserify-esbuild-and-others
    fs.copyFileSync(
      path.resolve('node_modules/pdfjs-dist/build/pdf.worker.js'),
      './static/pdf.worker.js'
    )
    break
  }
  case 'watch': {
    const ctx = await esbuild.context({
      ...options,
      define: {
        'window.IS_PRODUCTION': 'false'
      }
    })

    await ctx.watch()

    const { host, port } = await ctx.serve({
      servedir: OUTPUT_DIR
    })
    break
  }
  default: {
    console.error(`Invalid command specified: ${command}`)
    process.exit(1)
  }
}
