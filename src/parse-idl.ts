import * as webidl2 from 'webidl2'
import { logger } from './logger'

export async function parseIDL(idlString: string, options?: { preprocess: (input: string) => string }): Promise<webidl2.IDLRootType[]> {
  if (options?.preprocess) {
    idlString = options.preprocess(idlString)
  }

  const parsedIdl = webidl2.parse(idlString)
  logger.debug('parsedIdl')
  logger.debug(JSON.stringify(parsedIdl))

  return parsedIdl
}
