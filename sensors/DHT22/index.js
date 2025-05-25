const sensor = require('node-dht-sensor')

const sleep = (ms) => new Promise(res => { setTimeout(res, ms) })
/**
 *
 * @type { import('@sensors-center/types').IModule<{
 *    run: boolean,
 * }>}
 */
module.exports = {
  async init() {
    return {
      run: false
    }
  },
  async start(ctx) {
    if (ctx.state.run) {
      return
    }

    ctx.state.run = true

    const {
      sensorType = 22,
      sensorPort = 17,
      intervalMS = 5000
    } = ctx.moduleConfig

    while (ctx.state.run) {
      const res = await sensor.read(sensorType, sensorPort)
      await ctx.send([res.temperature, res.humidity])
      await sleep(intervalMS)
    }
  },
  async stop(ctx) {
    ctx.state.run = false
  },
  async destroy() {

  }
}
