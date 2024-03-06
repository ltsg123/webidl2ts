#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert = exports.convertMap = void 0;
var yargs = require("yargs");
var parse_idl_1 = require("./parse-idl");
var convert_idl_1 = require("./convert-idl");
var print_ts_1 = require("./print-ts");
var fs = require("fs");
var fetch_idl_1 = require("./fetch-idl");
var fixes_1 = require("./fixes");
var logger_1 = require("./logger");
var path = require("path");
/**
 * cache convert
 */
exports.convertMap = new Map();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var argv, options, fileNames, optionsArr;
        return __generator(this, function (_a) {
            argv = yargs
                .wrap(null)
                .scriptName('webidl2ts')
                .usage('Usage: $0 [options]')
                .example('$0 -i https://www.w3.org/TR/webxr/ -o webxr.d.ts', 'Generate from online documentation')
                .example('$0 -i https://www.khronos.org/registry/webgl/specs/latest/2.0/webgl2.idl -o webgl.d.ts', 'Generate from online idl file')
                .example('$0 -i ./my.idl -o my.d.ts', 'Generate local idl file')
                .example('$0 -i ./ammo.idl -o ammo.d.ts -n Ammo -ed', 'Generate a d.ts with default export for Ammo')
                .example('$0 -i ./ammo.idl -o ammo.d.ts -n Ammo -e', 'Generate a d.ts with ambient declaration only for Ammo')
                .help('h')
                .alias('h', 'help')
                .option('i', {
                describe: 'Input file or url',
                alias: 'in',
                demand: true,
            })
                .option('o', {
                describe: 'Output file path',
                alias: 'out',
                demand: true,
            })
                .option('e', {
                describe: 'Enable Emscripten mode',
                alias: 'emscripten',
                default: false,
                boolean: true,
            })
                .option('n', {
                describe: 'Name of the module (emscripten mode)',
                alias: 'name',
                default: 'Module',
            })
                .option('d', {
                describe: 'Write default export (emscripten mode)',
                alias: 'default-export',
                default: false,
                boolean: true,
            }).argv;
            options = {
                name: '',
                input: argv.i,
                output: argv.o,
                emscripten: argv.e,
                defaultExport: argv.d,
                module: argv.n,
            };
            if (!options.input) {
                process.exit(1);
            }
            if (fetch_idl_1.isDirectoryUrl(options.input)) {
                if (!fetch_idl_1.isDirectoryUrl(options.output)) {
                    throw new Error('You should make sure that the input / ouput types are the same (filename / directory)');
                }
                else {
                    fileNames = fetch_idl_1.findFileNames(options.input);
                    optionsArr = fileNames.map(function (file) {
                        return Object.assign({}, {
                            emscripten: argv.e,
                            defaultExport: argv.d,
                            module: argv.n,
                            name: file,
                            input: options.input + file + '.webidl',
                            output: options.output + file + '.ts',
                        });
                    });
                    optionsArr.forEach(function (options) {
                        try {
                            convert(options);
                        }
                        catch (e) {
                            logger_1.logger.error(options.output + " convert failed");
                        }
                    });
                }
            }
            else {
                options.name = path.basename(options.input, path.extname(options.input));
                if (fetch_idl_1.isDirectoryUrl(options.output)) {
                    options.output = options.output + options.name + '.ts';
                }
                convert(options);
            }
            return [2 /*return*/];
        });
    });
}
function convert(options) {
    return __awaiter(this, void 0, void 0, function () {
        var idlString, idl, ts, tsString, header;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (exports.convertMap.get(options.name)) {
                        logger_1.logger.debug("has converted, options is " + options);
                        return [2 /*return*/];
                    }
                    exports.convertMap.set(options.name, "// " + options.name);
                    logger_1.logger.debug("start convert, options is " + JSON.stringify(options));
                    return [4 /*yield*/, fetch_idl_1.fetchIDL(options.input)];
                case 1:
                    idlString = _a.sent();
                    logger_1.logger.debug("start parseIDL, idlString is " + idlString);
                    return [4 /*yield*/, parse_idl_1.parseIDL(idlString, {
                            preprocess: function (idl) {
                                if (options.emscripten) {
                                    idl = fixes_1.fixes.inheritance(idl);
                                    idl = fixes_1.fixes.array(idl);
                                }
                                return idl;
                            },
                        })];
                case 2:
                    idl = _a.sent();
                    return [4 /*yield*/, convert_idl_1.convertIDL(idl, options)];
                case 3:
                    ts = _a.sent();
                    tsString = null;
                    if (options.emscripten) {
                        tsString = print_ts_1.printEmscriptenModule(options.module, ts, options.defaultExport);
                    }
                    else {
                        tsString = print_ts_1.printTs(ts);
                    }
                    header = exports.convertMap.get(options.name);
                    console.log('result', header);
                    fs.writeFileSync(options.output, header.concat('\n\n').concat(tsString));
                    return [2 /*return*/];
            }
        });
    });
}
exports.convert = convert;
main();
