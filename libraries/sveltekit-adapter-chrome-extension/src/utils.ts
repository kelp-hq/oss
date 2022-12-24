import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
/**
 * Create missing dirs and then write a file
 * @param file -
 * @param data -
 */
export function write(file: string, data: string): void {
  try {
    mkdirSync(dirname(file), { recursive: true });
  } catch {
    // do nothing
  }

  writeFileSync(file, data);
}
