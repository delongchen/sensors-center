import { createClusterManager } from '../common/cluster-manager'
import { type AppConfig } from '@sensors-center/types'


const isAppConfig = (config: unknown): config is AppConfig => {
  return true
}

export const masterMain = async (config: unknown) => {
  if (!isAppConfig(config)) {
    process.exit(1)
  }

  const { submodules } = config

  const manager = createClusterManager({
    submodules,
    onWorkerForked: (worker, info) => {
      worker.on('message', (message: number[]) => {
        console.info(message)
      })
    }
  })

  manager.start()
}
