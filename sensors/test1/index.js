const sleep = (n) => new Promise(res => { setTimeout(res, n) })

/**
 *
 * @type { import('../../types').IModule }
 */
module.exports = {
  async init(ctx) {
    return {
      name: 'test1'
    }
  },
  async start(ctx) {
    while (true) {
      await ctx.sendDataUpdate([1])
      await sleep(1000)
    }
  },
  async stop(ctx) {
  },
  async destroy(ctx) {
  }
}


