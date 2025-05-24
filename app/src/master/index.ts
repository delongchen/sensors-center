import { createClusterManager } from '../common/cluster-manager'


export const masterMain = async () => {
  const manager = createClusterManager({
    submodules: [
      {
        path: '@sensors-center/test1',
        autostart: true,
      }
    ],
    messageHandler: (worker, message) => {

    }
  })

  manager.start()
}
