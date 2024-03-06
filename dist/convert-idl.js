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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertIDL = void 0;
var ts = require("typescript");
var cli_1 = require("./cli");
var fs = require("fs");
var logger_1 = require("./logger");
var ts_helper_1 = require("./ts-helper");
var bufferSourceTypes = [
    'ArrayBuffer',
    'ArrayBufferView',
    'DataView',
    'Int8Array',
    'Uint8Array',
    'Int16Array',
    'Uint16Array',
    'Uint8ClampedArray',
    'Int32Array',
    'Uint32Array',
    'Float32Array',
    'Float64Array',
];
var integerTypes = ['byte', 'octet', 'short', 'unsigned short', 'long', 'unsigned long', 'long long', 'unsigned long long'];
var stringTypes = ['ByteString', 'DOMString', 'USVString', 'CSSOMString'];
var floatTypes = ['float', 'unrestricted float', 'double', 'unrestricted double'];
var sameTypes = ['any', 'boolean', 'Date', 'Function', 'Promise', 'void'];
var baseTypeConversionMap = new Map(__spreadArrays(__spreadArrays(bufferSourceTypes).map(function (type) { return [type, type]; }), __spreadArrays(integerTypes).map(function (type) { return [type, 'number']; }), __spreadArrays(floatTypes).map(function (type) { return [type, 'number']; }), __spreadArrays(stringTypes).map(function (type) { return [type, 'string']; }), __spreadArrays(sameTypes).map(function (type) { return [type, type]; }), [
    ['object', 'any'],
    ['sequence', 'Array'],
    ['record', 'Record'],
    ['FrozenArray', 'ReadonlyArray'],
    ['EventHandler', 'EventHandler'],
    ['VoidPtr', 'unknown'],
]));
function convertIDL(rootTypes, options) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var nodes, _i, rootTypes_1, rootType, _b, dictionaryConvert, _c, _d, attr;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    nodes = [];
                    _i = 0, rootTypes_1 = rootTypes;
                    _e.label = 1;
                case 1:
                    if (!(_i < rootTypes_1.length)) return [3 /*break*/, 10];
                    rootType = rootTypes_1[_i];
                    _b = rootType.type;
                    switch (_b) {
                        case 'interface': return [3 /*break*/, 2];
                        case 'interface mixin': return [3 /*break*/, 2];
                        case 'dictionary': return [3 /*break*/, 2];
                        case 'includes': return [3 /*break*/, 4];
                        case 'enum': return [3 /*break*/, 5];
                        case 'callback': return [3 /*break*/, 6];
                        case 'typedef': return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 8];
                case 2: return [4 /*yield*/, convertInterface(rootType, options)];
                case 3:
                    dictionaryConvert = _e.sent();
                    nodes.push(dictionaryConvert);
                    for (_c = 0, _d = rootType.extAttrs; _c < _d.length; _c++) {
                        attr = _d[_c];
                        if (attr.name === 'Exposed' && ((_a = attr.rhs) === null || _a === void 0 ? void 0 : _a.value) === 'Window') {
                            nodes.push(ts.createVariableStatement([ts.createModifier(ts.SyntaxKind.DeclareKeyword)], ts.createVariableDeclarationList([
                                ts.createVariableDeclaration(ts.createIdentifier(rootType.name), ts.createTypeReferenceNode(ts.createIdentifier(rootType.name), undefined), undefined),
                            ], undefined)));
                        }
                    }
                    return [3 /*break*/, 9];
                case 4:
                    nodes.push(convertInterfaceIncludes(rootType));
                    return [3 /*break*/, 9];
                case 5:
                    nodes.push(convertEnum(rootType));
                    return [3 /*break*/, 9];
                case 6:
                    nodes.push(convertCallback(rootType));
                    return [3 /*break*/, 9];
                case 7:
                    nodes.push(convertTypedef(rootType));
                    return [3 /*break*/, 9];
                case 8:
                    console.log(newUnsupportedError('Unsupported IDL type', rootType));
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10: return [2 /*return*/, nodes];
            }
        });
    });
}
exports.convertIDL = convertIDL;
function convertTypedef(idl) {
    return ts.createTypeAliasDeclaration(undefined, undefined, ts.createIdentifier(idl.name), undefined, convertType(idl.idlType));
}
function createIterableMethods(name, keyType, valueType, pair, async) {
    return [
        ts.createMethodSignature([], [], ts.createExpressionWithTypeArguments(pair ? [ts.createTupleTypeNode([keyType, valueType])] : [valueType], ts.createIdentifier(async ? 'AsyncIterableIterator' : 'IterableIterator')), async ? '[Symbol.asyncIterator]' : '[Symbol.iterator]', undefined),
        ts.createMethodSignature([], [], ts.createExpressionWithTypeArguments([ts.createTupleTypeNode([keyType, valueType])], ts.createIdentifier(async ? 'AsyncIterableIterator' : 'IterableIterator')), 'entries', undefined),
        ts.createMethodSignature([], [], ts.createExpressionWithTypeArguments([keyType], ts.createIdentifier(async ? 'AsyncIterableIterator' : 'IterableIterator')), 'keys', undefined),
        ts.createMethodSignature([], [], ts.createExpressionWithTypeArguments([valueType], ts.createIdentifier(async ? 'AsyncIterableIterator' : 'IterableIterator')), 'values', undefined),
        ts.createMethodSignature([], [
            ts.createParameter([], [], undefined, 'callbackfn', undefined, ts.createFunctionTypeNode([], [
                ts.createParameter([], [], undefined, 'value', undefined, valueType),
                ts.createParameter([], [], undefined, pair ? 'key' : 'index', undefined, keyType),
                ts.createParameter([], [], undefined, pair ? 'iterable' : 'array', undefined, pair ? ts.createTypeReferenceNode(name, []) : ts.createArrayTypeNode(valueType)),
            ], ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword))),
            ts.createParameter([], [], undefined, 'thisArg', ts.createToken(ts.SyntaxKind.QuestionToken), ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)),
        ], ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword), 'forEach', undefined),
    ];
}
function convertChildren(childName, options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (childName) {
                logger_1.logger.debug('get childName', childName);
                return [2 /*return*/, new Promise(function (resolve) {
                        fs.access("./idl/" + childName + ".webidl", function (res) {
                            console.log(res);
                            if (!res) {
                                var header = cli_1.convertMap.get(options.name);
                                if (options && header && childName !== options.name && !ts_helper_1.isIncludesImportOrExport(header, childName)) {
                                    var importStr = ts_helper_1.getImports([childName]);
                                    console.log('importStr', importStr);
                                    cli_1.convertMap.set(options.name, header.concat('\n').concat(importStr));
                                }
                                cli_1.convert({
                                    input: "./idl/" + childName + ".webidl",
                                    output: "./ts/" + childName + ".ts",
                                    name: childName,
                                    emscripten: false,
                                    defaultExport: false,
                                    module: 'Module',
                                });
                            }
                            resolve();
                        });
                    })];
            }
            return [2 /*return*/];
        });
    });
}
function convertInterface(idl, options) {
    return __awaiter(this, void 0, void 0, function () {
        var members, needConvertedChildren, inheritance;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    members = [];
                    needConvertedChildren = [];
                    inheritance = [];
                    if (!('inheritance' in idl && idl.inheritance)) return [3 /*break*/, 2];
                    inheritance.push(ts.createExpressionWithTypeArguments(undefined, ts.createIdentifier(idl.inheritance)));
                    return [4 /*yield*/, convertChildren(idl.inheritance, options)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    idl.members.forEach(function (member) { return __awaiter(_this, void 0, void 0, function () {
                        var convertResult, indexedPropertyGetter, keyType, valueType, childNames;
                        return __generator(this, function (_a) {
                            switch (member.type) {
                                case 'attribute':
                                    if (options === null || options === void 0 ? void 0 : options.emscripten) {
                                        members.push(createAttributeGetter(member));
                                        members.push(createAttributeSetter(member));
                                    }
                                    convertResult = convertMemberAttribute(member);
                                    break;
                                case 'operation':
                                    if (member.name === idl.name) {
                                        convertResult = convertMemberConstructor(member, options);
                                    }
                                    else {
                                        convertResult = convertMemberOperation(member);
                                    }
                                    break;
                                case 'constructor':
                                    convertResult = convertMemberConstructor(member, options);
                                    break;
                                case 'field':
                                    convertResult = convertMemberField(member);
                                    break;
                                case 'const':
                                    convertResult = convertMemberConst(member);
                                    break;
                                case 'iterable': {
                                    indexedPropertyGetter = idl.members.find(function (member) {
                                        return member.type === 'operation' && member.special === 'getter' && member.arguments[0].idlType.idlType === 'unsigned long';
                                    });
                                    if ((indexedPropertyGetter && member.idlType.length === 1) || member.idlType.length === 2) {
                                        keyType = convertType(indexedPropertyGetter ? indexedPropertyGetter.arguments[0].idlType : member.idlType[0]);
                                        valueType = convertType(member.idlType[member.idlType.length - 1]);
                                        members.push.apply(members, createIterableMethods(idl.name, keyType, valueType, member.idlType.length === 2, member.async));
                                    }
                                    break;
                                }
                                default:
                                    console.log(newUnsupportedError('Unsupported IDL member', member));
                                    break;
                            }
                            if (convertResult) {
                                members.push(convertResult);
                                if (member['idlType']) {
                                    childNames = ts_helper_1.getKeys(member, 'idlType');
                                    console.log(childNames);
                                    console.log(member['idlType']['idlType'][0]['idlType']);
                                    needConvertedChildren.push.apply(needConvertedChildren, childNames);
                                }
                                else if (member['arguments']) {
                                    member['arguments'].forEach(function (arg) {
                                        var childName = arg.idlType.idlType;
                                        childName && needConvertedChildren.push(childName);
                                    });
                                }
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(needConvertedChildren.map(function (convert) { return convertChildren(convert, options); }))];
                case 3:
                    _a.sent();
                    if (options === null || options === void 0 ? void 0 : options.emscripten) {
                        return [2 /*return*/, ts.createClassDeclaration(undefined, [], ts.createIdentifier(idl.name), undefined, !inheritance.length ? undefined : [ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, inheritance)], members)];
                    }
                    return [2 /*return*/, ts.createInterfaceDeclaration(undefined, [], ts.createIdentifier(idl.name), undefined, !inheritance.length ? undefined : [ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, inheritance)], members)];
            }
        });
    });
}
function convertInterfaceIncludes(idl) {
    return ts.createInterfaceDeclaration(undefined, [], ts.createIdentifier(idl.target), undefined, [
        ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
            ts.createExpressionWithTypeArguments(undefined, ts.createIdentifier(idl.includes)),
        ]),
    ], []);
}
function createAttributeGetter(value) {
    return ts.createMethodSignature([], [], convertType(value.idlType), 'get_' + value.name, undefined);
}
function createAttributeSetter(value) {
    var parameter = ts.createParameter([], [], undefined, value.name, undefined, convertType(value.idlType));
    return ts.createMethodSignature([], [parameter], ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword), 'set_' + value.name, undefined);
}
function convertMemberOperation(idl) {
    var args = idl.arguments.map(convertArgument);
    return ts.createMethodSignature([], args, convertType(idl.idlType), idl.name, undefined);
}
function convertMemberConstructor(idl, options) {
    var args = idl.arguments.map(convertArgument);
    if (options.emscripten) {
        return ts.createMethodSignature([], args, undefined, 'constructor', undefined);
    }
    return ts.createConstructSignature([], args, undefined);
}
function convertMemberField(idl) {
    var optional = !idl.required ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined;
    return ts.createPropertySignature(undefined, ts.createIdentifier(idl.name), optional, convertType(idl.idlType), undefined);
}
function convertMemberConst(idl) {
    return ts.createPropertySignature([ts.createModifier(ts.SyntaxKind.ReadonlyKeyword)], ts.createIdentifier(idl.name), undefined, convertType(idl.idlType), undefined);
}
function convertMemberAttribute(idl) {
    return ts.createPropertySignature([idl.readonly ? ts.createModifier(ts.SyntaxKind.ReadonlyKeyword) : null].filter(function (it) { return it != null; }), ts.createIdentifier(idl.name), undefined, convertType(idl.idlType), undefined);
}
function convertArgument(idl) {
    var optional = idl.optional ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined;
    return ts.createParameter([], [], undefined, idl.name, optional, convertType(idl.idlType));
}
function convertType(idl) {
    if (typeof idl.idlType === 'string') {
        var type = baseTypeConversionMap.get(idl.idlType) || idl.idlType;
        switch (type) {
            case 'number':
                return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
            case 'string':
                return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
            case 'void':
                return ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
            default:
                return ts.createTypeReferenceNode(type, []);
        }
    }
    if (idl.generic) {
        var type = baseTypeConversionMap.get(idl.generic) || idl.generic;
        return ts.createTypeReferenceNode(ts.createIdentifier(type), idl.idlType.map(convertType));
    }
    if (idl.union) {
        return ts.createUnionTypeNode(idl.idlType.map(convertType));
    }
    console.log(newUnsupportedError('Unsupported IDL type', idl));
    return ts.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
}
function convertEnum(idl) {
    return ts.createTypeAliasDeclaration(undefined, undefined, ts.createIdentifier(idl.name), undefined, ts.createUnionTypeNode(idl.values.map(function (it) { return ts.createLiteralTypeNode(ts.createStringLiteral(it.value)); })));
}
function convertCallback(idl) {
    return ts.createTypeAliasDeclaration(undefined, undefined, ts.createIdentifier(idl.name), undefined, ts.createFunctionTypeNode(undefined, idl.arguments.map(convertArgument), convertType(idl.idlType)));
}
function newUnsupportedError(message, idl) {
    return new Error("\n  " + message + "\n  " + JSON.stringify(idl, null, 2) + "\n\n  Please file an issue at https://github.com/giniedp/webidl2ts and provide the used idl file or example.\n");
}
