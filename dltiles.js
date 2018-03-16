require('dotenv').config()
const Database = require('better-sqlite3')
const fetch = require('node-fetch')
const zlib = require('zlib')
const VectorTile = require('@mapbox/vector-tile').VectorTile
const Protobuf = require('pbf')
const cluster = require('cluster')
const numCPUs = require('os').cpus().length
const e = process.env

const g = function* gfn() {
  for (let z = Number(e.MZ); z <= Number(e.ZZ); z++) {
    const dz = z - Number(e.MZ), m = 2 ** dz
    for (let x = Number(e.MX) * m; x < (Number(e.MX) + 1) * m; x++) {
      for (let y = Number(e.MY) * m; y < (Number(e.MY) + 1) * m; y++) {
        yield {z: z, x: x, y: y, url: `${e.MU}/${z}/${x}/${y}.${e.EXT}`}
      }
    }
  }
}()

const getTile = async v => {
  let buf = null
  try { 
    const res = await fetch(v.url)
    console.log(`status ${res.status}`)
    if(res.status === 200) {
      buf = await res.buffer()
      let tile = new VectorTile(new Protobuf(buf))
      console.log(tile)
      if(e.GZIP) buf = zlib.gzipSync(buf)
    }
  } catch (err) {
    console.log(err)
  }
  process.send({z: v.z, x: v.x, y: v.y, buf: buf})
}

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork()
    worker.on('message', v => {
      // write the tile to mbtiles
      if (v.buf) {
        console.log(v)
      }
      worker.send(g.next()) 
    })
    worker.send(g.next())
  }
} else {
  process.on('message', v => {
    if(v.done) {
      setTimeout(() => {
        process.exit(0)
      }, 2000)
    } else {
      getTile(v.value)
    }
  })
}

