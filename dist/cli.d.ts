#!/usr/bin/env node
import { Options } from './types';
/**
 * cache convert
 */
export declare const convertMap: Map<string, string>;
export declare function convert(options: Options): Promise<void>;
