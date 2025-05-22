import { createClusterManager } from '../common/cluster-manager'


export const masterMain = async () => {
  const manager = createClusterManager({
    submodules: ['1', '2']
  })

  manager.start()
}
