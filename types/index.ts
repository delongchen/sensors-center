export interface ModuleContext<T> {
  state: T
}

export interface IModule<State> {
  init(ctx: ModuleContext<undefined>): Promise<State>
  start(ctx: ModuleContext<State>): Promise<void>
  stop(ctx: ModuleContext<State>): Promise<void>
  destroy(ctx: ModuleContext<State>): Promise<void>
}

export interface ModuleInfo {
  path: string;
  autostart: boolean;
}

export interface AppConfig {
  submodules: ModuleInfo[]
}
