/**
 *
 * @param str -
 * @returns string in kebab-case
 */
export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}