import cluster, { type Worker } from 'node:cluster'
import { ModuleInfo } from '@sensors-center/types'


interface WorkerExt {
  instance: Worker,
  restarts: number,
  lastActive: number,
  creation: number,
}

interface ClusterManagerProps {
  submodules?: ModuleInfo[],
  messageHandler?: (worker: Worker, message: any) => void
}

export const createClusterManager = (
  {
    submodules = [],
    messageHandler = () => {},
  }: ClusterManagerProps,
) => {
  const workers: Map<number, WorkerExt> = new Map

  const initWorker = (worker: Worker) => {
    workers.set(worker.id, {
      instance: worker,
      restarts: 0,
      lastActive: Date.now(),
      creation: Date.now()
    })

    worker.on('message', msg => {
      messageHandler(worker, msg)
    })
  }

  const forkWorkers = () => {
    for (const submodule of submodules) {
      const worker = cluster.fork({
        SUBMODULE_PATH: submodule,
      })

      initWorker(worker)
    }
  }

  const start = () => {
    forkWorkers()
  }

  const sendMessage = (id: number, message: any) => {
    return new Promise<void>((resolve, reject) => {
      const exist = workers.get(id)

      if (exist !== undefined) {
        exist.instance.send(message, err => {
          if (err !== null) {
            reject(err)
          } else {
            resolve()
          }
        })
      } else {
        reject(new Error(`Worker '${id}' not found`))
      }
    })
  }

  return {
    start,
    sendMessage,
  }
}
