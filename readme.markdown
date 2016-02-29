# ecuador-map-editor

osm-p2p map editor for remote mapping project in ecuador

# getting started

To install all dependencies and run the server, do:

```
$ npm install
$ npm run build
$ npm start
```

# development

To run the application with debugging enabled, do:

```
$ npm run dev
```

# custom imagery

To add local tiles for offline use, copy or symlink the files into
`public/tiles` (or some other location in `public/` and edit `imagery.json`
accordingly with a type of `tms`. For example:

``` json
[
  {
    "name": "local guyana tiles",
    "type": "tms",
    "template": "http://localhost:5000/tiles/{zoom}/{x}/{y}.jpg",
    "polygon": [
      [[2.115, -59.28],[2.345,-59.05]]
    ]
  }
]
```

```
$ ln -s ~/data/guyana_tiles/LC82310582015254LGN00 public/tiles
```

