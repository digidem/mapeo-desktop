# Mapeo Desktop

[![Build Status](https://github.com/digidem/mapeo-desktop/workflows/Node%20CD/badge.svg)](https://github.com/digidem/mapeo-desktop/actions)

An offline map editing application for indigenous territory mapping in remote
environments. It uses [osm-p2p](https://github.com/digidem/osm-p2p-db) for
offline peer-to-peer synchronization of an OpenStreetMap database, without any
server. The editor is based on [iDEditor](https://github.com/openstreetmap/iD/),
a simple and easy to use editor for OpenStreetMap. The app is web app built with
[Electron](http://electron.atom.io).

This project is under active development and we are testing it out in the field in Ecuador.

![screenshot](static/screenshot.png)

For a mobile application that is compatible with Mapeo Desktop, see [Mapeo Mobile](https://github.com/digidem/mapeo-mobile).

## Guide

Read the [online user guide](https://digital-democracy.gitbook.io/mapeo/) for
information on how to install aerial imagery and tiles, custom configurations,
and more. 

## Getting Started

To clone and install all dependencies and start a process to re-build the app whenever you change a file:

```sh
git clone git@github.com:digidem/mapeo-desktop.git
cd mapeo-desktop
npm install
npm run build:translations
npm run watch
```

Then, in another terminal, run the app in development mode:

```sh
npm run dev
```

## Testing

Data is stored in `USERDATA/Mapeo` on your machine, which will be different
depending on your operating system.

USERDATA is the per-user application data directory, which by default points to:
  * %APPDATA% on Windows
  * $XDG_CONFIG_HOME or ~/.config on Linux
  * ~/Library/Application Support on macOS

To simulate a reinstall, remove this `Mapeo` directory.

To only delete data and not presets or tiles, delete the `Mapeo/kappa.db`
directory.

### Run a mock device


```sh
DEBUG=* node `/bin/mock.js` --settings /path/to/my/file.mapeosettings
```

This runs a mock testing device that will broadcast itself on the local
network. This device saves it's data in tests/test-data.

### Run integration tests

```sh
npm run test-integration
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

## Building locally

Mapeo uses [Electron](http://electron.atom.io/). To package the Electron app as
a native Windows `.exe` or macOS `.dmg`, execute

```sh
npm run pack
```

The resultant installer or DMG will be placed in the `./dist` folder. You can only build Mapeo for the platform you run this command on, e.g. you need to run this on a Mac in order to build the Mac version of Mapeo.

## Contributing

Any development should be done on a branch or a fork, then create a Pull Request to the `master` branch. When ready to merge choose "Rebase" and enter a commit message that follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/#examples) specification, which at it's most basic is:

* Any new feature: start the commit message with `feat: `
* Any bugfix: start the commit message with `fix: `
* Anything else: start the commit message with `chore: `

These commit messages are important because they help others understand the changes and they are used to generate the [CHANGELOG](CHANGELOG.md).

Each Pull Request should only include a single fix or feature.

## Deploy workflow

Every push to Github is built automatically on Windows, Mac and Linux. The output of these builds can be seen in [the Actions tab](https://github.com/digidem/mapeo-desktop/actions). Each build creates installers which can be downloaded from the "Artifacts" button in the top-right of the logs of each build. These installers should only be used for internal testing. They will likely be unstable.

When you are ready to create a release, you need to create a git tag and update the [Changelog](CHANGELOG.md). The best way to do this is by running:

```sh
npm run release
```

This will use the commit messages to update the changelog and bump the version number. Then push the commit and tag to Github:

```sh
git push --follow-tags origin master
```

This will trigger a build that will upload the installers to the [releases](https://github.com/digidem/mapeo-desktop/releases) page. It will also upload the reference to the latest versino on the https://mapeo.world website using `bin/release-latest.js`.


## Community

Connect with the Mapeo community for support & to contribute!

- [**Mailing List**](https://lists.riseup.net/www/info/mapeo-en) (English)
- [**Mailing List**](https://lists.riseup.net/www/info/mapeo-es) (Spanish)
- [**IRC**](https://kiwiirc.com/nextclient/irc.freenode.net/) (channel #ddem)
- [**Slack**](http://slack.digital-democracy.org)

## License

GPLv3
