import { createClusterManager } from '../common/cluster-manager'
import type { Worker } from 'node:cluster'
import type {
  AppConfig,
  ChildMessage,
  CommandRequest,
  CommandResponse, DataUpdate,
  ModuleInfo,
  ProcessCommand
} from '@sensors-center/types'
import { logger } from '../logger'
import { randomUUID } from 'node:crypto'


const isAppConfig = (config: unknown): config is AppConfig => {
  if (typeof config !== 'object' || config === null) return false;

  // 检查submodules属性存在性
  if (!('submodules' in config)) return false;
  if (!('title' in config)) return false;

  // 验证submodules是数组类型
  const { submodules, title } = config as {
    submodules: unknown,
    title: unknown
  };
  if (!Array.isArray(submodules)) return false;
  if (typeof title !== 'string') return false;

  // 遍历验证每个子模块
  for (const mod of submodules) {
    // 检查模块对象类型
    if (typeof mod !== 'object' || mod === null) return false;

    // 验证必填的path属性及类型
    if (!('path' in mod) || typeof mod.path !== 'string') return false;

    // 检查可选属性类型（存在时才验证）
    if ('label' in mod && typeof mod.label !== 'string') return false;
    if ('autostart' in mod && typeof mod.autostart !== 'boolean') return false;
  }

  return true;
}

module.exports = async (config: unknown) => {
  logger.info(`Master ${process.pid} started`)

  const pendingRequests = new Map<string, (response: ChildMessage) => void>()

  if (!isAppConfig(config)) {
    process.exit(1)
  }

  const manager = createClusterManager({ submodules: config.submodules })

  const handleDataUpdate = (worker: Worker, info: ModuleInfo, message: DataUpdate) => {

  }

  const handleChildMessage = async (worker: Worker, info: ModuleInfo, message: ChildMessage) => {
    if (message.requestId !== undefined && pendingRequests.has(message.requestId)) {
      const resolver = pendingRequests.get(message.requestId)!
      resolver(message)
      pendingRequests.delete(message.requestId)
    }

    if (message.type === 'data_update') {
      handleDataUpdate(worker, info, message)
    } else if (message.type === 'error') {
      logger.error('Worker error', message)
    }
  }

  const onWorkerForked = (worker: Worker, info: ModuleInfo) => {
    logger.info(`Spawned worker for ${info.path} (PID: ${worker.process.pid})`)

    worker.on('exit', code => {
      logger.info(`Worker ${info.path} (PID: ${worker.process.pid}) exit! code: ${code}`)
    })

    worker.on('message', (message: ChildMessage) => {
      handleChildMessage(worker, info, message)
        .catch(error => {
          logger.error('', error)
        })
    })
  }

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

  manager.start({
    onWorkerForked,
  })

  return {
    sendCommand
  }
}
