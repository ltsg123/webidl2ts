"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.AgoraLogger = void 0;
function getTimestamp() {
    var date = new Date();
    return date.toTimeString().split(' ')[0] + ':' + date.getMilliseconds();
}
var logLevelMap = {
    DEBUG: 0,
    INFO: 1,
    WARNING: 2,
    ERROR: 3,
    NONE: 4,
};
var getLevelName = function (level) {
    for (var key in logLevelMap) {
        if (Object.prototype.hasOwnProperty.call(logLevelMap, key) && logLevelMap[key] === level) {
            return key;
        }
    }
    return 'DEFAULT';
};
/**
 * 控制 SDK 日志输出的对象，可以通过全局的 `Logger` 对象获取
 */
var AgoraLogger = /** @class */ (function () {
    function AgoraLogger() {
        this.logLevel = logLevelMap.DEBUG;
    }
    /** @internal */
    AgoraLogger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var argsWithLevel = [logLevelMap.DEBUG].concat(args);
        this.log.apply(this, argsWithLevel);
    };
    /** @internal */
    AgoraLogger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var argsWithLevel = [logLevelMap.INFO].concat(args);
        this.log.apply(this, argsWithLevel);
    };
    /** @internal */
    AgoraLogger.prototype.warning = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var argsWithLevel = [logLevelMap.WARNING].concat(args);
        this.log.apply(this, argsWithLevel);
    };
    /** @internal */
    AgoraLogger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.warning.apply(this, args);
    };
    /** @internal */
    AgoraLogger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var argsWithLevel = [logLevelMap.ERROR].concat(args);
        this.log(this, argsWithLevel);
    };
    /**
     * 设置 SDK 的日志输出级别
     * @param level - SDK 日志级别依次为 NONE(4)，ERROR(3)，WARNING(2)，INFO(1)，DEBUG(0)。选择一个级别，
     * 你就可以看到在该级别及该级别以上所有级别的日志信息。
     *
     * 例如，如果你输入代码 AgoraRTC.Logger.setLogLevel(1);，就可以看到 INFO，ERROR 和 WARNING 级别的日志信息。
     */
    AgoraLogger.prototype.setLogLevel = function (level) {
        level = Math.min(Math.max(0, level), 4);
        this.logLevel = level;
    };
    AgoraLogger.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var level = Math.max(0, Math.min(4, args[0]));
        args[0] = getTimestamp() + (" WebIDL [" + getLevelName(level) + "]:");
        if (level < this.logLevel)
            return;
        var prefix = getTimestamp() + (" %cWebIDL [" + getLevelName(level) + "]:");
        var argsWithStyle = [];
        switch (level) {
            case logLevelMap.DEBUG:
                argsWithStyle = [prefix, 'color: #64B5F6;'].concat(args.slice(1));
                console.log.apply(console, argsWithStyle);
                break;
            case logLevelMap.INFO:
                argsWithStyle = [prefix, 'color: #1E88E5; font-weight: bold;'].concat(args.slice(1));
                console.log.apply(console, argsWithStyle);
                break;
            case logLevelMap.WARNING:
                argsWithStyle = [prefix, 'color: #FB8C00; font-weight: bold;'].concat(args.slice(1));
                console.warn.apply(console, argsWithStyle);
                break;
            case logLevelMap.ERROR:
                argsWithStyle = [prefix, 'color: #B00020; font-weight: bold;'].concat(args.slice(1));
                console.error.apply(console, argsWithStyle);
                break;
        }
    };
    return AgoraLogger;
}());
exports.AgoraLogger = AgoraLogger;
exports.logger = new AgoraLogger();
