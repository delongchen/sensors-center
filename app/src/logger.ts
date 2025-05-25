import { format, createLogger, transports } from 'winston'
import 'winston-daily-rotate-file'
import cluster from 'cluster'

const { combine, timestamp, label, printf } = format

// 自定义日志格式
const logFormat = printf(({ level, message, label, timestamp, pid }) => {
  return `${timestamp} [${label}] ${level.toUpperCase()} (PID:${pid || process.pid}): ${message}`
})

// 进程专用传输配置
const workerTransport = new transports.Console({
  level: 'debug',
  format: combine(
    label({ label: 'WORKER' }),
    timestamp(),
    logFormat
  )
})

const agentTransport = new transports.DailyRotateFile({
  filename: 'logs/agent-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
  format: combine(
    label({ label: 'AGENT' }),
    timestamp(),
    logFormat
  )
})

const masterTransport = new transports.File({
  filename: 'logs/master.log',
  level: 'info',
  format: combine(
    label({ label: 'MASTER' }),
    timestamp(),
    logFormat
  )
})

// 创建基础日志实例
const baseLogger = createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  },
  exitOnError: false
})

// 进程类型判断
export const logger = baseLogger.add(cluster.isPrimary ? masterTransport :
  process.env.TYPE === 'AGENT' ? agentTransport : workerTransport)

// 增强版日志方法
export const moduleLogger = (moduleName: string) => ({
  info: (message: string) => logger.info(`[${moduleName}] ${message}`),
  error: (message: string) => logger.error(`[${moduleName}] ${message}`),
  debug: (message: string) => logger.debug(`[${moduleName}] ${message}`)
})
