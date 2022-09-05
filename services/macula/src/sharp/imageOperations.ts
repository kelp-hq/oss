/* eslint-disable unused-imports/no-unused-vars */
import { isTrue } from '@anagolay/utils';
import { isEmpty, isNil } from 'ramda';
import { ResizeOptions } from 'sharp';

export interface IImageExecConfig {
  methodName: string;
  params: (string | number | boolean | ISharpSharpenParams | ResizeOptions)[];
}

/**
 * Sharpen Interface
 * sigma number ? the sigma of the Gaussian mask, where sigma = 1 + radius / 2.
 * m1 number  the level of sharpening to apply to "flat" areas. (optional, default 1.0)
 * m2 number  the level of sharpening to apply to "jagged" areas. (optional, default 2.0)
 * x1 number  threshold between "flat" and "jagged" (optional, default 2.0)
 * y2 number  maximum amount of brightening. (optional, default 10.0)
 * y3 number  maximum amount of darkening. (optional, default 20.0)
 */
export interface ISharpSharpenParams {
  sigma?: number;
  m1?: number;
  m2?: number;
  x1?: number;
  y2?: number;
  y3?: number;
}

export function getBestMimeForRequest(): void {}

/**
 * Build the config that is processed and merged with the Sharp instance
 * @param url -
 * @returns
 */
export async function buildConfig(url: URL): Promise<IImageExecConfig[]> {
  const config: IImageExecConfig[] = [];

  // ------------------------------------------------------------- //

  const blurValue = url.searchParams.get('blur');
  if (!isNil(blurValue) && !isEmpty(blurValue)) {
    let params: number[] = [];

    if (!isTrue(blurValue)) {
      params = [parseInt(blurValue, 10)];
    }
    config.push({ methodName: 'blur', params });
  }

  // ------------------------------------------------------------- //

  const flipValue = url.searchParams.get('flip');
  if (!isNil(flipValue) && !isEmpty(flipValue)) {
    config.push({ methodName: 'flip', params: [true] });
  }

  // ------------------------------------------------------------- //

  const sharpenValue = url.searchParams.get('sharpen');
  if (!isNil(sharpenValue) && !isEmpty(sharpenValue)) {
    const params: ISharpSharpenParams = {};
    sharpenValue.split(',').map((v) => {
      const m = v.split(':') as [keyof ISharpSharpenParams, string];
      params[m[0]] = parseInt(m[1], 10);
    });
    config.push({ methodName: 'sharpen', params: [params] });
  }

  // ------------------------------------------------------------- //

  const widthValue = url.searchParams.get('w');
  const heightValue = url.searchParams.get('h');

  if (notNilAndEmpty(widthValue) || notNilAndEmpty(heightValue)) {
    const resizeOpts: ResizeOptions = {
      withoutEnlargement: true
    };

    if (!isNil(widthValue) && !isEmpty(widthValue)) {
      resizeOpts.width = parseInt(widthValue, 10);
    }
    if (!isNil(heightValue) && !isEmpty(heightValue)) {
      resizeOpts.height = parseInt(heightValue, 10);
    }

    config.push({ methodName: 'resize', params: [resizeOpts] });
  }
  // ------------------------------------------------------------- //

  return config;
}

/**
 * Checks is `!(null | undefined) && !empty` using ramda `isNil` and `isEmpty`
 * @param a - Any supporting type of `iNil` and `isEmpty`
 */
function notNilAndEmpty<T>(a: T): boolean {
  return !isNil(a) && !isEmpty(a);
}
