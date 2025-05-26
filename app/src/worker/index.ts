import type {
  CommandRequest,
  CommandResponse,
  DataUpdate,
  IModule,
  ModuleContext,
  ParentMessage
} from '@sensors-center/types'
import { moduleLogger } from '../logger'


const logger = moduleLogger(process.env.SUBMODULE_PATH!)

const sendMessageAsync = (message: any) => {
  return new Promise<void>((resolve, reject) => {
    process.send!(message, undefined, undefined, error => {
      if (error != null) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

const isModule = (mod: unknown): mod is IModule<any> => {
  return (
    typeof mod === "object" && mod !== null &&
    typeof Reflect.get(mod, 'init') === 'function' &&
    typeof Reflect.get(mod, 'start') === 'function' &&
    typeof Reflect.get(mod, 'stop') === 'function' &&
    typeof Reflect.get(mod, 'destroy') === 'function'
  )
}

const loadModule = (modPath: string) => {
  let result: unknown

  try {
    result = require(modPath)
  } catch (e) {
    throw new Error(`mod ${modPath} not found`)
  }

  if (!isModule(result)) {
    throw new Error(`mod ${modPath} is not a valid module`)
  }

  return result
}

const sendDataUpdate = (data: number[]) => {
  return sendMessageAsync({
    type: 'data_update',
    timestamp: Date.now(),
    pid: process.pid,
    data
  } satisfies DataUpdate)
}

const sendCommandResponse = (msg: CommandRequest, data?: any) => {
  return sendMessageAsync({
    type: 'command_response',
    timestamp: Date.now(),
    pid: process.pid,
    requestId: msg.requestId,
    command: msg.command,
    success: true,
    data
  } satisfies CommandResponse)
}

export const workerMain = async () => {
  const { SUBMODULE_PATH, SUBMODULE_CONFIG = '{}' } = process.env


  if (SUBMODULE_PATH === undefined) {
    process.exit(10001)
  }

  process.on('message', (msg: ParentMessage) => {
    switch (msg.type) {
      case 'command':
        // todo
        sendCommandResponse(msg)
        break
      case 'data_request':
        break
    }
  })

  let mod: IModule<any>
  try {
    mod = loadModule(SUBMODULE_PATH)
  } catch (e: any) {
    logger.error(e.message)
    process.exit(10002)
  }

  const ctx: ModuleContext<undefined> = {
    state: undefined,
    sendDataUpdate,
    moduleConfig: JSON.parse(SUBMODULE_CONFIG),
  }

  ctx.state = await mod.init(ctx).catch(err => {
    logger.error(`Error while initializing module: ${err}`)
    process.exit(10003)
  })

  logger.info('Worker initialized')

  mod.start(ctx)
    .catch(err => {
      process.exit(10004)
    })
}
