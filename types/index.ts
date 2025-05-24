export interface ModuleContext<T> {
  state: T
  send: (vec: number[]) => Promise<void>
  moduleConfig: any
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
  submodules: ModuleInfo[]
}
