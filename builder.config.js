/* eslint-disable no-template-curly-in-string */
const { externals } = require('./webpack.common')
const fs = require('fs')
const path = require('path')
const { nodeFileTrace } = require('@zeit/node-file-trace')

const config = {
  afterSign: 'bin/notarize.js',
  detectUpdateChannel: true,
  generateUpdatesFilesForAllChannels: true,
  appId: 'org.digital-democracy.mapeo-desktop',
  productName: 'Mapeo',
  artifactName: 'Installar_Mapeo_v${version}_${os}.${ext}',
  mac: {
    category: 'public.app-category.utilities',
    gatekeeperAssess: false,
    hardenedRuntime: true,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist'
  },
  win: {
    target: 'NSIS',
    artifactName: 'Installar_Mapeo_v${version}_${os}-${env.ARCH}.${ext}',
    rfc3161TimeStampServer: 'http://timestamp.digicert.com',
    timeStampServer: 'http://timestamp.digicert.com'
  },
  linux: {
    target: ['AppImage', 'deb'],
    category: 'Utility'
  },
  dmg: {
    icon: 'build/mapeo_installer.icns',
    title: '${productName} v${version}',
    sign: false,
    contents: [
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications'
      },
      {
        x: 130,
        y: 220,
        type: 'file'
      }
    ]
  },
  publish: [
    {
      provider: 's3',
      bucket: 'downloads.mapeo.app',
      path: '/desktop'
    },
    {
      provider: 'github',
      releaseType: 'release'
    }
  ],
  extraResources: [
    {
      from: 'build/app-update.yml',
      to: 'app-update.yml'
    }
  ]
}

const files = [
  'index.js',
  // include everything under static
  'static/**/*',
  // include all translations
  'messages/**/*',
  // Don't ship built sourcemaps, because they are 25Mb
  '!static/*.map',
  // Include everything under src…
  'src/main/**/*',
  'src/background/**/*',
  'src/*.js',
  'src/renderer/index-preload.js',
  '!**/node_modules/osm-p2p-db/benchmark${/*}',
  '!**/node_modules/osm-p2p-syncfile/chaos',
  '!**/node_modules/osm2obj/*.osc',
  '!**/node_modules/pannellum/*.{jpg,png}',
  '!**/node_modules/sodium-native/prebuilds/linux-arm',
  '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
  '!**/node_modules/**/{test,__tests__,tests,powered-test,example,examples}',
  '!**/node_modules/*.d.ts',
  '!**/node_modules/.bin',
  '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
  '!.editorconfig',
  '!**/._*',
  '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
  '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
  '!**/{appveyor.yml,.travis.yml,circle.yml}',
  '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}',
  '!test${/*}'
]

// Append last, these modules are excluded, but we need these files included
const extraIncludeFiles = [
  'node_modules/id-mapeo/dist/iD.css',
  'node_modules/id-mapeo/dist/*/**/*',
  'node_modules/mapbox-gl/dist/mapbox-gl.css'
]

module.exports = async () => {
  // Get required files for main and background process
  const { fileList } = await nodeFileTrace([
    './index.js',
    './src/background/index.js'
  ])

  // List of all modules we definitely want to include
  const includeModules = fileList.reduce((acc, cur) => {
    const path = cur.split('node_modules/').pop()
    let moduleName = path.split('/')[0]
    if (moduleName.startsWith('@')) moduleName += '/' + path.split('/')[1]
    acc.add(moduleName)
    return acc
  }, new Set([...externals, 'electron-is-dev']))

  const allModules = await (async function readDirs (dir) {
    let moduleNames = []

    const dirList = (
      await fs.promises.readdir(dir, {
        withFileTypes: true
      })
    )
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    for (const item of dirList) {
      if (item.startsWith('@')) {
        moduleNames = moduleNames.concat(
          (await readDirs(path.join(dir, item))).map(s => item + '/' + s)
        )
      } else if (item.startsWith('.')) {
        // ignore
      } else {
        moduleNames.push(item)
      }
    }
    return moduleNames
  })(path.join(__dirname, 'node_modules'))

  const excludeModules = []

  for (const moduleName of allModules) {
    if (!includeModules.has(moduleName)) {
      excludeModules.push(`!**/node_modules/${moduleName}/**/*`)
    }
  }

  config.files = [...files, ...excludeModules, ...extraIncludeFiles]

  return config
}
