import cluster from 'node:cluster'

import { masterMain } from './master'
import { workerMain } from './worker'


if (cluster.isPrimary) {
  masterMain()
} else {
  workerMain()
}
