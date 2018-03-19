require('dotenv').config()
const sqlite3 = require('sqlite3').verbose()
const MBTiles = require('@mapbox/mbtiles')
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
        yield {z: z, x: x, y: y, url: `${e.MU}/${z}/${y}/${x}.${e.EXT}`}
      }
    }
  }
}()

const getTile = async v => {
  let buf = null
  let status = -1
  try { 
    const res = await fetch(v.url)
    status = res.status
    if(res.status === 200) {
      buf = await res.buffer()
      if(e.GZIP === 'true') buf = zlib.gzipSync(buf)
    }
  } catch (err) {
    console.error(err)
  }
  process.send({
    z: v.z, x: v.x, y: v.y, buf: JSON.stringify(buf), status: status
  })
}

if (cluster.isMaster) {
  let stat = {}
  new MBTiles(e.MBTILES, (err, mbtiles) => {
    if (err) console.error(err)
    for (let i = 0; i < numCPUs; i++) {
      const worker = cluster.fork()
      worker.on('message', v => {
        stat[v.status] = stat[v.status] ? stat[v.status] + 1 : 1
        console.error(`${v.z}/${v.x}/${v.y} ${JSON.stringify(stat)}`)
        const json = JSON.parse(v.buf)
        if(json && json.type === 'Buffer') {
          /*
          mbtiles.startWriting(err => {
            if (err) console.error(err)
            mbtiles.putTile(v.z, v.x, v.y, 
              Buffer.from(json.data), err => {
              if (err) console.error(err)
              mbtiles.stopWriting(err => {
                if (err) console.error(err)
                worker.send(g.next()) 
              })
            })
          })
          */
          console.log(JSON.stringify(v))
        }
        worker.send(g.next())
      })
      worker.send(g.next())
    }
  })
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

