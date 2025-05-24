const sleep = (n) => new Promise(res => { setTimeout(res, n) })

module.exports = {
  async init(ctx) {
    return {
      name: 'test1'
    }
  },
  async start(ctx) {
    while (true) {
      console.info(ctx)
      await sleep(1000)
    }
  },
  async stop(ctx) {
  },
  async destroy(ctx) {
  }
}


