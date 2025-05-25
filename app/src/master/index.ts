import { createClusterManager } from '../common/cluster-manager'
import { type AppConfig } from '@sensors-center/types'
import { logger } from '../logger'


const isAppConfig = (config: unknown): config is AppConfig => {
  return true
}

export const masterMain = async (config: unknown) => {
  logger.info(`Master ${process.pid} started`)

  if (!isAppConfig(config)) {
    process.exit(1)
  }

  const { submodules } = config

  const manager = createClusterManager({
    submodules,
    onWorkerForked: (worker, info) => {
      logger.info(`Spawned worker for ${info.path} (PID: ${worker.process.pid})`)
      worker.on('message', (message: number[]) => {
        console.info(message)
      })
    }
  })

  manager.start()
}
