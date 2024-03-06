"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeys = exports.isIncludesImportOrExport = exports.getImports = exports.getExports = void 0;
function getExports(types) {
    if (!Array.isArray(types)) {
        return;
    }
    var exportStrings = [];
    var isExported = false;
    types.forEach(function (type) {
        if (type) {
            isExported = true;
            exportStrings.push(type);
        }
    });
    if (isExported) {
        return "export { " + exportStrings.join(', ') + " }";
    }
}
exports.getExports = getExports;
function getImports(types) {
    if (!Array.isArray(types)) {
        return;
    }
    console.log(types);
    var importStrings = [];
    var isExported = false;
    types.forEach(function (type) {
        if (type) {
            isExported = true;
            importStrings.push(type);
        }
    });
    if (isExported) {
        return importStrings.map(function (str) { return "import { " + str + " } from \"./" + str + "\""; }).join('\n');
    }
}
exports.getImports = getImports;
function isIncludesImportOrExport(header, type) {
    return header.includes(" " + type + " ");
}
exports.isIncludesImportOrExport = isIncludesImportOrExport;
function getKeys(obj, key) {
    var keys = [];
    if (typeof obj[key] === 'string') {
        keys.push(obj[key]);
    }
    else if (Array.isArray(obj[key])) {
        obj[key].forEach(function (child) {
            if (typeof child === 'object') {
                keys.push.apply(keys, getKeys(child, key));
            }
            else if (typeof child === 'string') {
                keys.push(child);
            }
        });
    }
    else if (typeof obj[key] === 'object') {
        keys.push.apply(keys, getKeys(obj[key], key));
    }
    return keys;
}
exports.getKeys = getKeys;
