# dltiles
download tiles

## synopsis
This tool downloads the tile {MZ}/{MX}/{MY} and its children recursively up to the zoom {ZZ}.

## usage
```
$ vi .env
$ node dltiles.js
```

## contents of .env
### synopsis
```
MBTILES = ${path for output mbtiles}
MU = ${front part of template URL before /{z}/{x}/{y}.pbf}
MZ = ${z of the first tile to download}
MX = ${x of the first tile to download}
MY = ${y of the first tile to download}
ZZ = ${max_zoom of the tiles to download}
EXT = ${filename extension of the tiles, e.g. pbf}
ORDER = ${order of z, x, y. ZXY or ZYX. esri implementations use ZYX.}
GZIP = ${true if this tool gzips downloaded files in mbtiles.}
```

### example
```
MBTILES = example.mbtiles
MU = https://example.com/xyz/std
MZ = 5
MX = 16
MY = 10
ZZ = 16
EXT = pbf
ORDER = ZXY
GZIP = true
```
This will download https://exmaple/com/xyz/std/5/16/10.pbf and its children recursively up to z=16 and store them into example.mbtiles.

## notes
- store.js was used to store tiles given from pipe, but it is no longer necessary, store.js will be deleted.
