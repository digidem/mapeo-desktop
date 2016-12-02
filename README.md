# Mapfilter Desktop

Mapfilter Desktop is an _experimental_ offline-first mapping and reporting app to facilitate reporting observations in time & space of physical phenomena.

It uses [osm-p2p](https://github.com/digidem/osm-p2p-db) for offline peer-to-peer synchronization of an OpenStreetMap database, without any
servers.

This project is under active development and is still at the early prototyping phase.

# Getting Started

To clone and install all dependencies and start the program, execute

```
$ git clone git@github.com:digidem/mapfilter-desktop.git
$ cd mapfilter-desktop
$ npm install
$ npm start
```

# Development

## Packaging

Mapfilter Desktop uses [Electron](http://electron.atom.io/). To package the Electron app as a native Windows `.exe` or macOS `.dmg`, execute

```
$ npm run create-windows-installer
```
or
```
$ npm run create-macos-installer
```

The resultant installer or DMG will be placed in the `./dist` folder.

## Creating a Release

Mapfilter Desktop uses [GitHub Releases](https://help.github.com/articles/about-releases/) for deployment.

To create a release, simply push a git tag to the repository. A convenient way
to both advance the project by a version *and* push a tag is using the `npm
version` command. To create a new minor version and push it to the github
repository to initiate a build, one might run

```
$ npm version minor

$ git push --tags
```

A github release will be created automatically. Simultaneously, an
[Appveyor](appveyor.yml) build will be started to create a Windows installer,
and a [Travis](.travis.yml) build will be started for a macOS DMG. Each will be
added to the github release asynchronously as they complete.

You'll be able to find the results on the project's [releases](../../releases/) page.

# License

MIT
