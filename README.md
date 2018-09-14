# Mapeo Desktop

Mac/Linux   | Windows    |
------------|------------|
[![Build Status](https://travis-ci.org/digidem/mapeo-desktop.svg?branch=master)](https://travis-ci.org/digidem/mapeo-desktop) | [![Appveyor Status](https://ci.appveyor.com/api/projects/status/gmaclennan/ecuador-map-editor?branch=master&svg=true)](https://ci.appveyor.com/project/gmaclennan/ecuador-map-editor)

An offline map editing application for indigenous territory mapping in remote
environments. It uses [osm-p2p](https://github.com/digidem/osm-p2p-db) for
offline peer-to-peer synchronization of an OpenStreetMap database, without any
server. The editor is based on [iDEditor](https://github.com/openstreetmap/iD/),
a simple and easy to use editor for OpenStreetMap. The app is web app built with
[Electron](http://electron.atom.io).

This project is under active development and we are testing it out in the field in Ecuador.

![screenshot](static/screenshot.png)

For a mobile application that is compatible with Mapeo Desktop, see [Mapeo Mobile](https://github.com/digidem/mapeo-mobile).

# Getting Started

To clone and install all dependencies and start the program, execute

```
$ git clone git@github.com:digidem/mapeo-desktop.git
$ cd mapeo-desktop
$ npm install
$ npm run build
$ npm run rebuild-leveldb
$ npm rebuild
$ npm start
```

# Local Development

To run the application with debugging enabled, execute

```
$ npm run dev
```

## Testing

### Run a mock device

```
$ npm run device
```

This runs a mock testing device that will broadcast itself on the local
network. This device saves it's data in tests/test-data.


### Run integration tests

```
$ npm run test-integration
```

The integration tests use Spectron and Tape. They click through the app, taking screenshots and
comparing each one to a reference. Why screenshots?

* Ad-hoc checking makes the tests a lot more work to write
* Even diffing the whole HTML is not as thorough as screenshot diffing. For example, it wouldn't
  catch an bug where hitting ESC from a video doesn't correctly restore window size.
* Chrome's own integration tests use screenshot diffing iirc
* Small UI changes will break a few tests, but the fix is as easy as deleting the offending
  screenshots and running the tests, which will recreate them with the new look.
* The resulting Github PR will then show, pixel by pixel, the exact UI changes that were made! See
  https://github.com/blog/817-behold-image-view-modes

For MacOS, you'll need a Retina screen for the integration tests to pass. Your screen should have
the same resolution as a 2016 12" Macbook.

For Windows, you'll need Windows 10 with a 1366x768 screen.

When running integration tests, keep the mouse on the edge of the screen and don't touch the mouse
or keyboard while the tests are running.

# Packaging

Mapeo uses [Electron](http://electron.atom.io/). To package the Electron app as
a native Windows `.exe` or macOS `.dmg`, execute

```
$ npm run installer-win
```
or
```
$ npm run dmg-mac
```

The resultant installer or DMG will be placed in the `./dist` folder.

# Creating a Release

Mapeo uses [GitHub Releases](https://help.github.com/articles/about-releases/)
for deployment.

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

# Custom Imagery

See [downloading tiles for offline use](docs/offline_tiles.md).

# Custom Presets

(coming soon)

# License

MIT
