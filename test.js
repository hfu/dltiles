const MBTiles = require('@mapbox/mbtiles')
const zlib = require('zlib')
const VectorTile = require('@mapbox/vector-tile').VectorTile
const Protobuf = require('pbf')
new MBTiles('./test.mbtiles', (err, mbtiles) => {
  if (err) {
    console.log(err)
  } else {
    mbtiles.getTile(8, 151, 127, (err, data, headers) => {
      buf = zlib.gunzipSync(data)
      console.log(buf)
      let tile = new VectorTile(new Protobuf(buf))
      console.log(tile)
    })
  }
})
