import { includes, isEmpty, isNil } from 'ramda';

const shouldParse: string[] = ['ALLOWED_REFERRERS'];

/**
 * Return the env variable, if needs parsing it will be parsed via the JSON.parse
 * @param name -
 * @param defaultValue -
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEnv<T>(name: string, defaultValue?: T): any {
  let envVar: T;

  if (isNil(process.env[name]) || isEmpty(process.env[name])) {
    // throw new Error(`Env variable ${name} doesn't exist.`);
    if (isNil(defaultValue)) {
      throw new Error(`defaultValue for ${name} is not set and we could not fid it in the env`);
    }
    envVar = defaultValue;
  } else {
    envVar = process.env[name] as unknown as T;
  }
  // console.log('envVar', name, envVar);

  if (includes(name, shouldParse)) {
    return JSON.parse(envVar as unknown as string);
  } else {
    return envVar;
  }
}
