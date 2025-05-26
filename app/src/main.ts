import cluster from 'node:cluster'


if (cluster.isPrimary) {
  const program = new (require('commander').Command)
  const path = require('node:path')
  const { readFileSync } = require('node:fs')

  program
    .option('-c, --config <path>', 'path to the config', './app.config.json')
    .parse(process.argv)

  const options = program.opts()

  const configFilePath = path.resolve(options.config)
  const configFIleText = readFileSync(configFilePath, 'utf8')
  const config = JSON.parse(configFIleText)

  require('./master')(config)
} else {
  require('./worker')()
}
