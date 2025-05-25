const SerialPort = require('serialport')


const openPortAsync = (port) => {
  return new Promise((resolve, reject) => {
    port.open(err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

const isDataLegal = data => (
  data.length >= 6 &&
  (data[0] === 0xbb && data[1] === 0xaa && data[2] === 1) &&
  (data[5] === ((358 + data[3] + data[4]) & 0xff))
)

/**
 *
 * @type { import('@sensors-center/types').IModule<{
 *   port: import('serialport').SerialPort,
 *   run: boolean,
 * }> }
 */
module.exports = {
  async init(ctx) {
    const { path = '/dev/ttyAMA2', baudRate = 115200 } = ctx.moduleConfig

    const port = new SerialPort.SerialPort({
      path,
      baudRate,
      autoOpen: false,
    })

    await openPortAsync(port)

    return { port, run: false }
  },
  async start(ctx) {
    if (ctx.state.run) {
      return
    }

    ctx.state.run = true

    ctx.state.port.on('data', data => {
      if (ctx.state.run && isDataLegal(data)) {
        const db = (data[4] << 8) + data[3]
        ctx.send([db])
      }
    })
  },
  async stop(ctx) {
    ctx.state.run = false
  },
  async destroy() {

  }
}
