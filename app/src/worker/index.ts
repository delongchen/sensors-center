import type { IModule, ModuleContext } from '@sensors-center/types'


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

export const workerMain = async () => {
  const { SUBMODULE_PATH } = process.env

  if (SUBMODULE_PATH === undefined) {
    process.exit('E_NO_MOD_NAME')
  }

  let mod: IModule<any>
  try {
    mod = loadModule(SUBMODULE_PATH)
  } catch (e) {
    process.exit('E_LOAD_MOD_FAILED')
  }

  const ctx: ModuleContext<undefined> = {
    state: undefined
  }

  ctx.state = await mod.init(ctx).catch(err => {
    process.exit('E_MOD_INIT_FAILED')
  })

  mod.start(ctx)
    .catch(err => {
      process.exit('E_')
    })
}
