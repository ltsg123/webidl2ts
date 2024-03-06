declare function getExports(types: string[]): string;
declare function getImports(types: string[]): string;
declare function isIncludesImportOrExport(header: string, type: string): boolean;
declare function getKeys(obj: any, key: string): string[];
export { getExports, getImports, isIncludesImportOrExport, getKeys };
