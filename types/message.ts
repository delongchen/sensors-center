export type ProcessCommand = 'init' | 'start' | 'stop' | 'destroy';

export interface BaseMessage<T extends string> {
  type: T;
  timestamp: number;
  pid: number;
  requestId?: string; // 用于请求-响应匹配
}

// 父进程 -> 子进程的消息类型
export type ParentMessage =
  | CommandRequest
  | DataRequest;

export interface CommandRequest extends BaseMessage<'command'> {
  command: ProcessCommand;
  payload?: unknown; // 各命令的特定参数
}

export interface DataRequest extends BaseMessage<'data_request'> {
  frequency?: number; // 数据请求频率（可选）
}

// 子进程 -> 父进程的消息类型
export type ChildMessage =
  | CommandResponse
  | DataUpdate
  | ErrorMessage;

export interface CommandResponse extends BaseMessage<'command_response'> {
  success: boolean;
  command: ProcessCommand;
  data?: unknown;
  error?: string;
}

export interface DataUpdate extends BaseMessage<'data_update'> {
  data: number[];
}

export interface ErrorMessage extends BaseMessage<'error'> {
  error: string;
  stack?: string;
}
