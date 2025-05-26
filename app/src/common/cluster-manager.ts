import cluster, { type Worker } from 'node:cluster'
import { ModuleInfo } from '@sensors-center/types'


interface WorkerExt {
  instance: Worker,
  info: ModuleInfo,
  restarts: number,
  lastActive: number,
  creation: number,
}

interface ClusterManagerProps {
  submodules?: ModuleInfo[],
}

export const createClusterManager = (
  {
    submodules = [],
  }: ClusterManagerProps,
) => {
  const workers: Map<number, WorkerExt> = new Map

  const forkWorkers = (
    onWorkerForked: (worker: Worker, info: ModuleInfo) => void
  ) => {
    for (const submodule of submodules) {
      const worker = cluster.fork({
        SUBMODULE_PATH: submodule.path,
        SUBMODULE_CONFIG: JSON.stringify(submodule.config),
      })

      onWorkerForked(worker, submodule)

      workers.set(worker.id, {
        info: submodule,
        instance: worker,
        restarts: 0,
        lastActive: Date.now(),
        creation: Date.now()
      })
    }
  }

  const start = ({
    onWorkerForked = () => {}
  }: {
    onWorkerForked: (worker: Worker, info: ModuleInfo) => void,
  }) => {
    forkWorkers(onWorkerForked)
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
    workers,
  }
}
