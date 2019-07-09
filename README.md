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

In another terminal, run `npm run watch` to automatically generate the
front-end bundle every time it is changed.

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
$ npm run pack
```

The resultant installer or DMG will be placed in the `./dist` folder.

If you want to build the binaries and also publish to GitHub, use

```
$ npm run dist
```

For this, you'll need to generate a GitHub access token from https://github.com/settings/tokens/new and assign it to an environment variable with ```export GH_TOKEN="<TOKEN_HERE>```.

### Deploy workflow

1. Create a draft release on github, e.g. `vX.Y.Z`
1. Change `version` field in `package.json` to `X.Y.Z`
1. Commit and push modified `package.json` (repeat until release is ready)
1. Once done, publish the release on github, which will create the tag

Also see https://www.electron.build/configuration/publish

You'll be able to find the results on the project's [releases](../../releases/) page.

# Custom Imagery

See [downloading tiles for offline use](docs/offline_tiles.md).

# Custom Presets

Presets must be placed in this folder:

```txt
%USERDATA%/Mapeo/presets/default
```

This folder (`default`) should contain these files directly in under this
`default` folder (i.e. no sub-folder with a different name):

```txt
presets.json
icons/
  myIcon-medium@1x.png
  myIcon-medium@2x.png
  myIcon-medium@3x.png
  ...etc
```

# Community

Connect with the Mapeo community for support & to contribute!

- [**Mailing List**](https://lists.riseup.net/www/info/mapeo-en) (English)
- [**Mailing List**](https://lists.riseup.net/www/info/mapeo-es) (Spanish)
- [**IRC**](https://kiwiirc.com/nextclient/irc.freenode.net/) (channel #ddem)
- [**Slack**](http://slack.digital-democracy.org)

# License

GPLv3
