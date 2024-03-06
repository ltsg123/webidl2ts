import * as webidl2 from 'webidl2'
import * as ts from 'typescript'
import { Options } from './types'
import { convert, convertMap } from './cli'
import * as fs from 'fs'
import { logger } from './logger'
import { getImports, getKeys, isIncludesImportOrExport } from './ts-helper'

const bufferSourceTypes = [
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
]
const integerTypes = ['byte', 'octet', 'short', 'unsigned short', 'long', 'unsigned long', 'long long', 'unsigned long long']
const stringTypes = ['ByteString', 'DOMString', 'USVString', 'CSSOMString']
const floatTypes = ['float', 'unrestricted float', 'double', 'unrestricted double']
const sameTypes = ['any', 'boolean', 'Date', 'Function', 'Promise', 'void']
const baseTypeConversionMap = new Map<string, string>([
  ...[...bufferSourceTypes].map((type) => [type, type] as [string, string]),
  ...[...integerTypes].map((type) => [type, 'number'] as [string, string]),
  ...[...floatTypes].map((type) => [type, 'number'] as [string, string]),
  ...[...stringTypes].map((type) => [type, 'string'] as [string, string]),
  ...[...sameTypes].map((type) => [type, type] as [string, string]),
  ['object', 'any'],
  ['sequence', 'Array'],
  ['record', 'Record'],
  ['FrozenArray', 'ReadonlyArray'],
  ['EventHandler', 'EventHandler'],
  ['VoidPtr', 'unknown'],
])

export async function convertIDL(rootTypes: webidl2.IDLRootType[], options?: Options): Promise<ts.Statement[]> {
  const nodes: ts.Statement[] = []
  for (const rootType of rootTypes) {
    switch (rootType.type) {
      case 'interface':
      case 'interface mixin':
      case 'dictionary':
        {
          const dictionaryConvert = await convertInterface(rootType, options)
          nodes.push(dictionaryConvert)
          for (const attr of rootType.extAttrs) {
            if (attr.name === 'Exposed' && attr.rhs?.value === 'Window') {
              nodes.push(
                ts.createVariableStatement(
                  [ts.createModifier(ts.SyntaxKind.DeclareKeyword)],
                  ts.createVariableDeclarationList(
                    [
                      ts.createVariableDeclaration(
                        ts.createIdentifier(rootType.name),
                        ts.createTypeReferenceNode(ts.createIdentifier(rootType.name), undefined),
                        undefined,
                      ),
                    ],
                    undefined,
                  ),
                ),
              )
            }
          }
        }
        break
      case 'includes':
        nodes.push(convertInterfaceIncludes(rootType))
        break
      case 'enum':
        nodes.push(convertEnum(rootType))
        break
      case 'callback':
        nodes.push(convertCallback(rootType))
        break
      case 'typedef':
        nodes.push(convertTypedef(rootType))
        break
      default:
        console.log(newUnsupportedError('Unsupported IDL type', rootType))
        break
    }
  }
  return nodes
}

function convertTypedef(idl: webidl2.TypedefType) {
  return ts.createTypeAliasDeclaration(undefined, undefined, ts.createIdentifier(idl.name), undefined, convertType(idl.idlType))
}

function createIterableMethods(name: string, keyType: ts.TypeNode, valueType: ts.TypeNode, pair: boolean, async: boolean) {
  return [
    ts.createMethodSignature(
      [],
      [],
      ts.createExpressionWithTypeArguments(
        pair ? [ts.createTupleTypeNode([keyType, valueType])] : [valueType],
        ts.createIdentifier(async ? 'AsyncIterableIterator' : 'IterableIterator'),
      ),
      async ? '[Symbol.asyncIterator]' : '[Symbol.iterator]',
      undefined,
    ),
    ts.createMethodSignature(
      [],
      [],
      ts.createExpressionWithTypeArguments(
        [ts.createTupleTypeNode([keyType, valueType])],
        ts.createIdentifier(async ? 'AsyncIterableIterator' : 'IterableIterator'),
      ),
      'entries',
      undefined,
    ),
    ts.createMethodSignature(
      [],
      [],
      ts.createExpressionWithTypeArguments([keyType], ts.createIdentifier(async ? 'AsyncIterableIterator' : 'IterableIterator')),
      'keys',
      undefined,
    ),
    ts.createMethodSignature(
      [],
      [],
      ts.createExpressionWithTypeArguments([valueType], ts.createIdentifier(async ? 'AsyncIterableIterator' : 'IterableIterator')),
      'values',
      undefined,
    ),
    ts.createMethodSignature(
      [],
      [
        ts.createParameter(
          [],
          [],
          undefined,
          'callbackfn',
          undefined,
          ts.createFunctionTypeNode(
            [],
            [
              ts.createParameter([], [], undefined, 'value', undefined, valueType),
              ts.createParameter([], [], undefined, pair ? 'key' : 'index', undefined, keyType),
              ts.createParameter(
                [],
                [],
                undefined,
                pair ? 'iterable' : 'array',
                undefined,
                pair ? ts.createTypeReferenceNode(name, []) : ts.createArrayTypeNode(valueType),
              ),
            ],
            ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
          ),
        ),
        ts.createParameter(
          [],
          [],
          undefined,
          'thisArg',
          ts.createToken(ts.SyntaxKind.QuestionToken),
          ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
        ),
      ],
      ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
      'forEach',
      undefined,
    ),
  ]
}

async function convertChildren(childName: string, options?: Options) {
  if (childName) {
    logger.debug('get childName', childName)

    return new Promise((resolve) => {
      fs.access(`./idl/${childName}.webidl`, (res) => {
        console.log(res)
        if (!res) {
          const header = convertMap.get(options.name)

          if (options && header && childName !== options.name && !isIncludesImportOrExport(header, childName)) {
            const importStr = getImports([childName])
            console.log('importStr', importStr)
            convertMap.set(options.name, header.concat('\n').concat(importStr))
          }
          convert({
            input: `./idl/${childName}.webidl`,
            output: `./ts/${childName}.ts`,
            name: childName,
            emscripten: false,
            defaultExport: false,
            module: 'Module',
          })
        }
        resolve()
      })
    })
  }
}

async function convertInterface(idl: webidl2.InterfaceType | webidl2.DictionaryType | webidl2.InterfaceMixinType, options?: Options) {
  const members: ts.TypeElement[] = []
  const needConvertedChildren: string[] = []
  const inheritance = []
  if ('inheritance' in idl && idl.inheritance) {
    inheritance.push(ts.createExpressionWithTypeArguments(undefined, ts.createIdentifier(idl.inheritance)))
    await convertChildren(idl.inheritance, options)
  }

  idl.members.forEach(async (member: webidl2.IDLInterfaceMemberType | webidl2.FieldType) => {
    let convertResult: ts.PropertySignature | ts.MethodSignature | ts.ConstructSignatureDeclaration
    switch (member.type) {
      case 'attribute':
        if (options?.emscripten) {
          members.push(createAttributeGetter(member))
          members.push(createAttributeSetter(member))
        }
        convertResult = convertMemberAttribute(member)
        break
      case 'operation':
        if (member.name === idl.name) {
          convertResult = convertMemberConstructor(member, options)
        } else {
          convertResult = convertMemberOperation(member)
        }
        break
      case 'constructor':
        convertResult = convertMemberConstructor(member, options)
        break
      case 'field':
        convertResult = convertMemberField(member)
        break
      case 'const':
        convertResult = convertMemberConst(member)
        break
      case 'iterable': {
        type Members = Array<webidl2.IDLInterfaceMemberType | webidl2.FieldType | webidl2.IDLInterfaceMixinMemberType>
        const indexedPropertyGetter = (idl.members as Members).find(
          (member): member is webidl2.OperationMemberType =>
            member.type === 'operation' && member.special === 'getter' && member.arguments[0].idlType.idlType === 'unsigned long',
        )

        if ((indexedPropertyGetter && member.idlType.length === 1) || member.idlType.length === 2) {
          const keyType = convertType(indexedPropertyGetter ? indexedPropertyGetter.arguments[0].idlType : member.idlType[0])
          const valueType = convertType(member.idlType[member.idlType.length - 1])
          members.push(...createIterableMethods(idl.name, keyType, valueType, member.idlType.length === 2, member.async))
        }
        break
      }
      default:
        console.log(newUnsupportedError('Unsupported IDL member', member))
        break
    }

    if (convertResult) {
      members.push(convertResult)

      if (member['idlType']) {
        const childNames = getKeys(member, 'idlType')
        console.log(childNames)
        console.log(member['idlType']['idlType'][0]['idlType'])
        needConvertedChildren.push(...childNames)
      } else if (member['arguments']) {
        member['arguments'].forEach((arg) => {
          const childName = arg.idlType.idlType
          childName && needConvertedChildren.push(childName)
        })
      }
    }
  })
  await Promise.all(needConvertedChildren.map((convert) => convertChildren(convert, options)))

  if (options?.emscripten) {
    return ts.createClassDeclaration(
      undefined,
      [],
      ts.createIdentifier(idl.name),
      undefined,
      !inheritance.length ? undefined : [ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, inheritance)],
      members as any, // TODO:
    )
  }

  return ts.createInterfaceDeclaration(
    undefined,
    [],
    ts.createIdentifier(idl.name),
    undefined,
    !inheritance.length ? undefined : [ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, inheritance)],
    members,
  )
}

function convertInterfaceIncludes(idl: webidl2.IncludesType) {
  return ts.createInterfaceDeclaration(
    undefined,
    [],
    ts.createIdentifier(idl.target),
    undefined,
    [
      ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.createExpressionWithTypeArguments(undefined, ts.createIdentifier(idl.includes)),
      ]),
    ],
    [],
  )
}

function createAttributeGetter(value: webidl2.AttributeMemberType) {
  return ts.createMethodSignature([], [], convertType(value.idlType), 'get_' + value.name, undefined)
}

function createAttributeSetter(value: webidl2.AttributeMemberType) {
  const parameter = ts.createParameter([], [], undefined, value.name, undefined, convertType(value.idlType))
  return ts.createMethodSignature([], [parameter], ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword), 'set_' + value.name, undefined)
}

function convertMemberOperation(idl: webidl2.OperationMemberType) {
  const args = idl.arguments.map(convertArgument)
  return ts.createMethodSignature([], args, convertType(idl.idlType), idl.name, undefined)
}

function convertMemberConstructor(idl: webidl2.ConstructorMemberType | webidl2.OperationMemberType, options?: Options) {
  const args = idl.arguments.map(convertArgument)
  if (options.emscripten) {
    return ts.createMethodSignature([], args, undefined, 'constructor', undefined)
  }
  return ts.createConstructSignature([], args, undefined)
}

function convertMemberField(idl: webidl2.FieldType) {
  const optional = !idl.required ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined
  return ts.createPropertySignature(undefined, ts.createIdentifier(idl.name), optional, convertType(idl.idlType), undefined)
}

function convertMemberConst(idl: webidl2.ConstantMemberType) {
  return ts.createPropertySignature(
    [ts.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
    ts.createIdentifier(idl.name),
    undefined,
    convertType(idl.idlType),
    undefined,
  )
}

function convertMemberAttribute(idl: webidl2.AttributeMemberType) {
  return ts.createPropertySignature(
    [idl.readonly ? ts.createModifier(ts.SyntaxKind.ReadonlyKeyword) : null].filter((it) => it != null),
    ts.createIdentifier(idl.name),
    undefined,
    convertType(idl.idlType),
    undefined,
  )
}

function convertArgument(idl: webidl2.Argument) {
  const optional = idl.optional ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined
  return ts.createParameter([], [], undefined, idl.name, optional, convertType(idl.idlType))
}

function convertType(idl: webidl2.IDLTypeDescription): ts.TypeNode {
  if (typeof idl.idlType === 'string') {
    const type = baseTypeConversionMap.get(idl.idlType) || idl.idlType
    switch (type) {
      case 'number':
        return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
      case 'string':
        return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
      case 'void':
        return ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
      default:
        return ts.createTypeReferenceNode(type, [])
    }
  }
  if (idl.generic) {
    const type = baseTypeConversionMap.get(idl.generic) || idl.generic
    return ts.createTypeReferenceNode(ts.createIdentifier(type), idl.idlType.map(convertType))
  }
  if (idl.union) {
    return ts.createUnionTypeNode(idl.idlType.map(convertType))
  }

  console.log(newUnsupportedError('Unsupported IDL type', idl))
  return ts.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
}

function convertEnum(idl: webidl2.EnumType) {
  return ts.createTypeAliasDeclaration(
    undefined,
    undefined,
    ts.createIdentifier(idl.name),
    undefined,
    ts.createUnionTypeNode(idl.values.map((it) => ts.createLiteralTypeNode(ts.createStringLiteral(it.value)))),
  )
}

function convertCallback(idl: webidl2.CallbackType) {
  return ts.createTypeAliasDeclaration(
    undefined,
    undefined,
    ts.createIdentifier(idl.name),
    undefined,
    ts.createFunctionTypeNode(undefined, idl.arguments.map(convertArgument), convertType(idl.idlType)),
  )
}

function newUnsupportedError(message: string, idl: unknown) {
  return new Error(`
  ${message}
  ${JSON.stringify(idl, null, 2)}

  Please file an issue at https://github.com/giniedp/webidl2ts and provide the used idl file or example.
`)
}
