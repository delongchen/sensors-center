import cluster, { type Worker } from 'node:cluster'


interface WorkerExt {
  instance: Worker,
  restarts: number,
  lastActive: number,
}

interface ClusterManagerProps {
  submodules?: string[],
}

export const createClusterManager = (
  {
    submodules = [],
  }: ClusterManagerProps,
) => {
  const workers: Map<number, WorkerExt> = new Map

  const handleWorkerMessage = (worker: Worker, msg: any) => {

  }

  const initWorker = (worker: Worker) => {
    workers.set(worker.id, {
      instance: worker,
      restarts: 0,
      lastActive: Date.now(),
    })

    worker.on('message', msg => {
      handleWorkerMessage(worker, msg)
    })
  }

  const forkWorkers = () => {
    let workerID = 0

    for (const submodule of submodules) {
      const worker = cluster.fork({
        SUBMODULE_NAME: submodule,
        WORKER_ID: workerID++,
      })

      initWorker(worker)
    }
  }

  const start = () => {
    forkWorkers()
  }

  return {
    start,
  }
}
