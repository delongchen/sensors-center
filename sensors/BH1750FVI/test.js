const i2c = require('i2c-bus')

const sleep = (n) => new Promise(res => { setTimeout(res, n) })

/** @type { import('@sensors-center/types').IModule<{
 * bus: import('i2c-bus').PromisifiedBus
 * buf: Buffer
 * run: boolean
 }> } */
module.exports = {
  async init(ctx) {
    const bus = await i2c.openPromisified(1)
    await bus.sendByte(0x23, 0x10)
    const buf = Buffer.alloc(2)

    return {
      bus,
      buf,
      run: false
    }
  },
  async start(ctx) {
    const { bus, buf } = ctx.state

    if (ctx.state.run) {
      return
    }

    ctx.state.run = true

    while (ctx.state.run) {
      await sleep(150)
      await bus.i2cRead(0x23, 2, buf)
      console.log(((buf[1] << 8) | buf[0]))
    }
  },
  async stop(ctx) {
    ctx.state.run = false
  },
  async destroy(ctx) {

  }
}
