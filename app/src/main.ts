import cluster from 'node:cluster'
import * as path from 'node:path'
import { readFileSync } from 'node:fs'

import { Command } from 'commander'

import { masterMain } from './master'
import { workerMain } from './worker'


if (cluster.isPrimary) {
  const program = new Command()

  program
    .option('-c, --config <path>', 'path to the config', './app.config.json')
    .parse(process.argv)

  const options = program.opts()

  const configFilePath = path.resolve(options.config)
  const configFIleText = readFileSync(configFilePath, 'utf8')
  const config = JSON.parse(configFIleText)

  masterMain(config)
} else {
  workerMain()
}
