function getTimestamp(): string {
  const date = new Date()
  return date.toTimeString().split(' ')[0] + ':' + date.getMilliseconds()
}

const logLevelMap = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
  NONE: 4,
}

const getLevelName = (level: number): string => {
  for (const key in logLevelMap) {
    if (Object.prototype.hasOwnProperty.call(logLevelMap, key) && (logLevelMap as any)[key] === level) {
      return key
    }
  }
  return 'DEFAULT'
}

/**
 * 控制 SDK 日志输出的对象，可以通过全局的 `Logger` 对象获取
 */
export class AgoraLogger {
  private logLevel: number = logLevelMap.DEBUG

  /** @internal */
  public debug(...args: any): void {
    const argsWithLevel = [logLevelMap.DEBUG].concat(args)
    this.log(...argsWithLevel)
  }

  /** @internal */
  public info(...args: any): void {
    const argsWithLevel = [logLevelMap.INFO].concat(args)
    this.log(...argsWithLevel)
  }

  /** @internal */
  public warning(...args: any): void {
    const argsWithLevel = [logLevelMap.WARNING].concat(args)
    this.log(...argsWithLevel)
  }

  /** @internal */
  public warn(...args: any): void {
    this.warning(...args)
  }

  /** @internal */
  public error(...args: any): void {
    const argsWithLevel = [logLevelMap.ERROR].concat(args)
    this.log(this, argsWithLevel)
  }

  /**
   * 设置 SDK 的日志输出级别
   * @param level - SDK 日志级别依次为 NONE(4)，ERROR(3)，WARNING(2)，INFO(1)，DEBUG(0)。选择一个级别，
   * 你就可以看到在该级别及该级别以上所有级别的日志信息。
   *
   * 例如，如果你输入代码 AgoraRTC.Logger.setLogLevel(1);，就可以看到 INFO，ERROR 和 WARNING 级别的日志信息。
   */
  public setLogLevel(level: number): void {
    level = Math.min(Math.max(0, level), 4)

    this.logLevel = level
  }

  private log(...args: any[]): void {
    const level = Math.max(0, Math.min(4, args[0]))
    args[0] = getTimestamp() + ` WebIDL [${getLevelName(level)}]:`
    if (level < this.logLevel) return

    const prefix = getTimestamp() + ` %cWebIDL [${getLevelName(level)}]:`
    let argsWithStyle: string[] = []

    switch (level) {
      case logLevelMap.DEBUG:
        argsWithStyle = [prefix, 'color: #64B5F6;'].concat(args.slice(1))
        ;(console as any).log.apply(console, argsWithStyle)
        break
      case logLevelMap.INFO:
        argsWithStyle = [prefix, 'color: #1E88E5; font-weight: bold;'].concat(args.slice(1))
        ;(console as any).log.apply(console, argsWithStyle)
        break
      case logLevelMap.WARNING:
        argsWithStyle = [prefix, 'color: #FB8C00; font-weight: bold;'].concat(args.slice(1))
        ;(console as any).warn.apply(console, argsWithStyle)
        break
      case logLevelMap.ERROR:
        argsWithStyle = [prefix, 'color: #B00020; font-weight: bold;'].concat(args.slice(1))
        ;(console as any).error.apply(console, argsWithStyle)
        break
    }
  }
}

export const logger = new AgoraLogger()
