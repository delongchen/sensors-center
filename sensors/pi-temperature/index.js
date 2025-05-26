const { readFile } = require('node:fs/promises')


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

    const { intervalMS = 2000 } = ctx.moduleConfig

    while (ctx.state.run) {
      const text = await readFile('/sys/class/thermal/thermal_zone0/temp', 'utf8')
      const pi_temp = +(text.trim())
      await ctx.sendDataUpdate([pi_temp])
      await sleep(intervalMS)
    }
  },
  async stop(ctx) {
    ctx.state.run = false
  },
  async destroy() {

  }
}
