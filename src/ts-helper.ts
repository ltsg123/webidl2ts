function getExports(types: string[]): string {
  if (!Array.isArray(types)) {
    return
  }
  const exportStrings = []
  let isExported = false
  types.forEach((type) => {
    if (type) {
      isExported = true
      exportStrings.push(type)
    }
  })
  if (isExported) {
    return `export { ${exportStrings.join(', ')} }`
  }
}

function getImports(types: string[]): string {
  if (!Array.isArray(types)) {
    return
  }
  console.log(types)
  const importStrings = []
  let isExported = false
  types.forEach((type) => {
    if (type) {
      isExported = true
      importStrings.push(type)
    }
  })
  if (isExported) {
    return importStrings.map((str) => `import { ${str} } from "./${str}"`).join('\n')
  }
}

function isIncludesImportOrExport(header: string, type: string): boolean {
  return header.includes(` ${type} `)
}

function getKeys(obj: any, key: string): string[] {
  const keys: string[] = []
  if (typeof obj[key] === 'string') {
    keys.push(obj[key])
  } else if (Array.isArray(obj[key])) {
    obj[key].forEach((child) => {
      if (typeof child === 'object') {
        keys.push(...getKeys(child, key))
      } else if (typeof child === 'string') {
        keys.push(child)
      }
    })
  } else if (typeof obj[key] === 'object') {
    keys.push(...getKeys(obj[key], key))
  }

  return keys
}

export { getExports, getImports, isIncludesImportOrExport, getKeys }
