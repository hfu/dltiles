throw('store.js is no longer necessary.')

require('dotenv').config()
const MBTiles = require('@mapbox/mbtiles')
const readline = require('readline')

new MBTiles(process.env.MBTILES, (err, mbtiles) => {
  mbtiles.startWriting(err => {
    if (err) console.error(err)
    const rl = readline.createInterface({input: process.stdin})
    rl.on('line', line => {
      let json = JSON.parse(line)
      mbtiles.putTile(json.z, json.x, json.y, Buffer.from(json.buf), err => {
        if (err) console.error(err)
      })
    })
    rl.on('pause', () => {
      console.log('HEY IT PAUSES!')
    })
    rl.on('resume', () => {
      console.log('HEY IT RESUMES!')
    })
    rl.on('close', () => {
      mbtiles.stopWriting(err => {
        if (err) console.error(err)
        console.log('closed.')
      })
    })
  })
})
