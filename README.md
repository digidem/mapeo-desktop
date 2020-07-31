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

Running `npm run dev` will run the background process in an electron window
that can be stepped through similarly to the front-end code.

To see log messages in real-time while in debug mode, run `tail` in another
terminal window:

```sh
tail -f USERDATA/Mapeo/logs/$DATE.debug.log
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.


## Community

Connect with the Mapeo community for support & to contribute!

- [**Mailing List**](https://lists.riseup.net/www/info/mapeo-en) (English)
- [**Mailing List**](https://lists.riseup.net/www/info/mapeo-es) (Spanish)
- [**IRC**](https://kiwiirc.com/nextclient/irc.freenode.net/) (channel #ddem)
- [**Slack**](http://slack.digital-democracy.org)

## License

GPLv3
