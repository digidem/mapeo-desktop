# Using offline aerial imagery with Mapeo

These instructions were written with
[POSIX](https://en.wikipedia.org/wiki/POSIX) systems in mind (Linux, macOS).
Windows users may have to infer some of the differences in the commands shown.


### Automatic Import

Mapeo has a built-in tile importer. Go to `File->Import Offline Map Tiles...` and
point Mapeo to the tiles you want to use. It accepts a directory of tiles
organized by `/path/to/my/tiles/{zoom}/{x}/{y}`. You can change these paramters
when you launch Mapeo desktop in the background imagery layers menu. 

![import.png](import.png)

## Background imagery layers menu

In the Map Editor, press 'b' to open the imagery layers menu. Choose 'Custom'
from the bottom list.  If you used automatic import, you can use the default
setting. You can modify the paramters based upon your setup.

Mapeo runs its own maptile server in the background. The server for tile data that is imported from the `File->Import Offline Map  Tiles...` should be:

```
http://localhost:5005/Offline-Maps/tiles/{zoom}/{x}/{y}
```

### Download the Tile Data

If you don't have tile data already, you can use a commandline tool that we created to do this. First, make sure you have [npm](https://www.npmjs.com/get-npm) installed.

Next, install [tile-dl](https://github.com/noffle/tile-dl):

```
npm install --global tile-dl
```

`tile-dl` needs to be told the latitude, longitude, zoom level, and radius of
the area to download locally.

To find the latitude and longitude of the area, open Mapeo Desktop and navigate
to the rough centre of the area you're interested in. In the bottom right hand
corner of the screen you'll see two numbers separated by a comma. These are your
current longitude and latitude (in that order). Note them.

Let's store the template for a map tile provider for use by tile-dl:
```
$ echo 'https://c.tiles.mapbox.com/v4/digitalglobe.0a8e44ba/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNqOGRmNW9qZjBudmgzMnA1a294OGRtNm8ifQ.06mo-nDisy4KmqjYxEVwQw' > url_template
```
On Windows
``` cmd
Set url_template="https://c.tiles.mapbox.com/v4/digitalglobe.0a8e44ba/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNqOGRmNW9qZjBudmgzMnA1a294OGRtNm8ifQ.06mo-nDisy4KmqjYxEVwQw"
```

Now you can invoke the `tile-dl` program:

```
$ tile-dl -t "$(cat url_template)" --lon=-122.2632601 --lat=37.8027446 \
          --radius 0.1 --zoom 12 --output tiles/{z}/{x}/{y}.png
```
On Windows
``` cmd
tile-dl -t %url_template% --lon=-122.2632601 --lat=37.8027446 --radius 0.1 --zoom 12 --output tiles/{z}/{x}/{y}.png
```

This example downloads the area around Oakland, California. You can tweak the
parameters to meet your needs:

- `lat`: The latitude at the centre of your download area.
- `lon`: The longitude at the centre of your download area.
- `radius`: The size of the area to download, in kilometres.
- `zoom`: The zoom level to use. 9 is a very wide area; 11 is a large area; 13
  is the size of a village; 16 is the size of a small road.

The above zoom level figures are very rough. Experiment with small radii and see
how the results look: you can open the resulting JPGs or PNGs with an image
viewer and see if they look appropriate to your needs.

Map tile providers offer these satellite images for free; please don't abuse
their generosity by downloading more than what you need.

