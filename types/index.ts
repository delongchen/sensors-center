import type { Logger } from 'winston'

export * from './message'

export interface ModuleContext<T> {
  state: T
  sendDataUpdate: (data: number[]) => Promise<void>
  moduleConfig: any
  logger: {
    info: (msg: string) => Logger,
    error: (msg: string) => Logger,
    debug: (msg: string) => Logger,
  }
}

export interface IModule<State> {
  init(ctx: ModuleContext<undefined>): Promise<State>
  start(ctx: ModuleContext<State>): Promise<void>
  stop(ctx: ModuleContext<State>): Promise<void>
  destroy(ctx: ModuleContext<State>): Promise<void>
}

export interface ModuleInfo {
  path: string;
  label?: string;
  autostart?: boolean;
  config?: any;
}

export interface AppConfig {
  title: string;
  submodules: ModuleInfo[]
}
