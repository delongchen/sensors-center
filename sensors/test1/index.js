const sleep = (n) => new Promise(res => { setTimeout(res, n) })

/**
 *
 * @type { import('../../types').IModule }
 */
module.exports = {
  async init(ctx) {
    ctx.logger.debug(`config: ${JSON.stringify(ctx.moduleConfig)}`);

    return {
      name: 'test1'
    }
  },
  async start(ctx) {
    while (true) {
      await ctx.sendDataUpdate([1])
      await sleep(2000)
      ctx.logger.debug('test tick 2000ms')
    }
  },
  async stop(ctx) {
  },
  async destroy(ctx) {
  }
}


