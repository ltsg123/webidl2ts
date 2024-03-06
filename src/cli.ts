#!/usr/bin/env node

import * as yargs from 'yargs'
import { parseIDL } from './parse-idl'
import { convertIDL } from './convert-idl'
import { printTs, printEmscriptenModule } from './print-ts'
import * as fs from 'fs'
import { fetchIDL, findFileNames, isDirectoryUrl } from './fetch-idl'
import { Options } from './types'
import { fixes } from './fixes'
import { logger } from './logger'
import path = require('path')

/**
 * cache convert
 */
export const convertMap = new Map<string, string>()

async function main() {
  const argv = yargs
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
    }).argv

  const options: Options = {
    name: '',
    input: argv.i as string,
    output: argv.o as string,
    emscripten: argv.e,
    defaultExport: argv.d,
    module: argv.n,
  }

  if (!options.input) {
    process.exit(1)
  }

  if (isDirectoryUrl(options.input)) {
    if (!isDirectoryUrl(options.output)) {
      throw new Error('You should make sure that the input / ouput types are the same (filename / directory)')
    } else {
      const fileNames = findFileNames(options.input)
      const optionsArr = fileNames.map((file) =>
        Object.assign(
          {},
          {
            emscripten: argv.e,
            defaultExport: argv.d,
            module: argv.n,
            name: file,
            input: options.input + file + '.webidl',
            output: options.output + file + '.ts',
          },
        ),
      )
      optionsArr.forEach((options) => {
        try {
          convert(options)
        } catch (e) {
          logger.error(`${options.output} convert failed`)
        }
      })
    }
  } else {
    options.name = path.basename(options.input, path.extname(options.input))
    if (isDirectoryUrl(options.output)) {
      options.output = options.output + options.name + '.ts'
    }
    convert(options)
  }
}

export async function convert(options: Options): Promise<void> {
  if (convertMap.get(options.name)) {
    logger.debug(`has converted, options is ${options}`)
    return
  }
  convertMap.set(options.name, `// ${options.name}`)
  logger.debug(`start convert, options is ${JSON.stringify(options)}`)

  const idlString = await fetchIDL(options.input)
  logger.debug(`start parseIDL, idlString is ${idlString}`)
  const idl = await parseIDL(idlString, {
    preprocess: (idl: string) => {
      if (options.emscripten) {
        idl = fixes.inheritance(idl)
        idl = fixes.array(idl)
      }
      return idl
    },
  })

  const ts = await convertIDL(idl, options)

  let tsString: string = null
  if (options.emscripten) {
    tsString = printEmscriptenModule(options.module, ts, options.defaultExport)
  } else {
    tsString = printTs(ts)
  }

  const header = convertMap.get(options.name)
  console.log('result', header)

  fs.writeFileSync(options.output, header.concat('\n\n').concat(tsString))
}

main()
