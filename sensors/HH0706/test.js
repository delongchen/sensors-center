const { SerialPort } = require('serialport')


const port = new SerialPort({
  path: '/dev/ttyAMA2',
  baudRate: 115200,
  autoOpen: false,
})

port.open(err => {
  if (err) {
    console.error(err)
    return
  }

  console.info('open')
})

const sleep = (n) => new Promise(res => { setTimeout(res, n) })

const isDataLegal = data => (
  data.length >= 6 &&
  (data[0] === 0xbb && data[1] === 0xaa && data[2] === 1) &&
  (data[5] === ((358 + data[3] + data[4]) & 0xff))
)

port.on('data',data => {
  if (isDataLegal(data)) {
    console.info((data[4] << 8) + data[3])
  }
})
