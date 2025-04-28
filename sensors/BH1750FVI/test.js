const i2c = require('i2c-bus')

const sleep = (n) => new Promise(res => { setTimeout(res, n) })

const main = async () => {
  const bus = await i2c.openPromisified(1)
  await bus.sendByte(0x23, 0x10)
  const buf = Buffer.alloc(2)
  while (true) {
    await sleep(150)
    await bus.i2cRead(0x23, 2, buf)
    console.log(((buf[1] << 8) | buf[0]))
  }
}

main().catch(console.error)
