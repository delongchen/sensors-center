import { createClusterManager } from '../common/cluster-manager'
import type {AppConfig, ChildMessage, CommandRequest, CommandResponse, ProcessCommand} from '@sensors-center/types'
import { logger } from '../logger'
import { randomUUID } from 'node:crypto'


const isAppConfig = (config: unknown): config is AppConfig => {
  return true
}

export const masterMain = async (config: unknown) => {
  logger.info(`Master ${process.pid} started`)

  const pendingRequests = new Map<string, (response: ChildMessage) => void>()

  if (!isAppConfig(config)) {
    process.exit(1)
  }

  const { submodules } = config

  const manager = createClusterManager({
    submodules,
    onWorkerForked: (worker, info) => {
      logger.info(`Spawned worker for ${info.path} (PID: ${worker.process.pid})`)

      worker.on('exit', code => {
        logger.info(`Worker ${info.path} (PID: ${worker.process.pid}) exit! code: ${code}`)
      })

      worker.on('message', (message: ChildMessage) => {
        if (message.requestId !== undefined && pendingRequests.has(message.requestId)) {
          const resolver = pendingRequests.get(message.requestId)!
          resolver(message)
          pendingRequests.delete(message.requestId)
        }

        if (message.type === 'data_update') {
          console.info(`[data_update] ${info.path}: ${message.data}`)
        } else if (message.type === 'error') {

        }
      })
    }
  })

  const sendCommand = (workerID: number, command: ProcessCommand, payload?: any) => {
    return new Promise<CommandResponse>((resolve, reject) => {
      const requestId = randomUUID()
      const msg: CommandRequest = {
        type: 'command',
        timestamp: Date.now(),
        pid: process.pid,
        requestId,
        command,
        payload,
      }

      pendingRequests.set(requestId, resolve as () => ChildMessage)

      manager
        .sendMessage(workerID, msg)
        .catch(reject)
    })
  }

  manager.start()
}
