# ecuador-map-editor

An _experimental_ offline mapping app for indigenous territory mapping in remote environments. It uses [osm-p2p](https://github.com/digidem/osm-p2p-db) for offline peer-to-peer synchronization of an OpenStreetMap database, without any server. The editor is based on [iDEditor](https://github.com/openstreetmap/iD/), a simple and easy to use editor for OpenStreetMap. The app is web app built with [Electron](http://electron.atom.io) for desktop integration and offline usage.

This project is under active development and is still at the prototype phase, although we are already testing it out in the field in Ecuador.

# getting started

To clone and install all dependencies and run the server, do:

```
$ git clone git@github.com:digidem/ecuador-map-editor.git
$ cd ecuador-map-editor
$ npm install
$ npm run build
$ npm start
```

# development

To run the application with debugging enabled, do:

```
$ npm run dev
```

# Packaging

To package the app as a mac osx or windows app:

```
$ npm run package-win
$ npm run package-mac
```

Build files will be in the `./dist` folder. Note that we do not yet create a windows installer, the folder needs to be copied manually to `C:\Program Files` and you will need to set up manual shortcuts for the start menu.

# custom imagery

To add local tiles for offline use, copy or symlink a folder of tiles into 'tiles' within the app's folder in your application directory, which by default points to:

- %APPDATA% on Windows
- $XDG_CONFIG_HOME or ~/.config on Linux
- ~/Library/Application Support on OS X

The app folder will be `electron` if you are in development, or the application name (currently "CEIBO Mapeo") if you are working with the packaged app. E.g. on a mac, copy the folder of image tiles into: `~/Library/Application Support/CEIBO Mapeo/tiles`

Edit `imagery.json` accordingly with a type of `tms`. The tileserver runs on localhost on port `5005`. For example:

``` json
[
  {
    "name": "local guyana tiles",
    "type": "tms",
    "template": "http://localhost:5005/guyana/{zoom}/{x}/{y}.jpg",
    "polygon": [
      [[2.115, -59.28],[2.345,-59.05]]
    ]
  }
]
```

```
$ ln -s ~/data/guyana_tiles/LC82310582015254LGN00 public/tiles/guyana
```

# Custom presets
