const sensor = require('node-dht-sensor').promises

sensor.read(22, 17, console.info)

