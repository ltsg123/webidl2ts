/**
 * 控制 SDK 日志输出的对象，可以通过全局的 `Logger` 对象获取
 */
export declare class AgoraLogger {
    private logLevel;
    /** @internal */
    debug(...args: any): void;
    /** @internal */
    info(...args: any): void;
    /** @internal */
    warning(...args: any): void;
    /** @internal */
    warn(...args: any): void;
    /** @internal */
    error(...args: any): void;
    /**
     * 设置 SDK 的日志输出级别
     * @param level - SDK 日志级别依次为 NONE(4)，ERROR(3)，WARNING(2)，INFO(1)，DEBUG(0)。选择一个级别，
     * 你就可以看到在该级别及该级别以上所有级别的日志信息。
     *
     * 例如，如果你输入代码 AgoraRTC.Logger.setLogLevel(1);，就可以看到 INFO，ERROR 和 WARNING 级别的日志信息。
     */
    setLogLevel(level: number): void;
    private log;
}
export declare const logger: AgoraLogger;
