import { isFalse, isTrue } from '@anagolay/utils';
import { isEmpty, isNil } from 'ramda';
import { JpegOptions, PngOptions, WebpOptions } from 'sharp';

import { IMaculaFormatOptions } from './toFormat';

/**
 * Look for a `q` search param and return its value
 * @param url -
 * @param defaultValue -
 * @returns
 */
export function getQualityFromSearchParams(url: URL, defaultValue: number = 80): number {
  const q = url.searchParams.get('q');
  return !isNil(q) && !isEmpty(q) ? parseInt(q, 10) : defaultValue;
}
/**
 * Look for a `name` search param and return its value as a string
 * @param url -
 * @param defaultValue -
 * @returns
 */
export function getStringFromSearchParams(url: URL, name: string, defaultValue: string): string {
  const a = url.searchParams.get(name);
  return !isNil(a) && !isEmpty(a) ? a : defaultValue;
}
/**
 * Look for a `name` search param and return its value as a boolean
 * @param url -
 * @param defaultValue -
 * @returns
 */
export function getBooleanFromSearchParams(url: URL, name: string, defaultValue: boolean): boolean {
  const a = url.searchParams.get(name);
  if (!isNil(a) && !isEmpty(a)) {
    if (isTrue(a)) {
      return isTrue(a);
    } else {
      return isFalse(a);
    }
  }
  return defaultValue;
}

/**
 * Take URL and
 * @param url -
 */
export function jpegParams(url: URL): JpegOptions {
  const opts: JpegOptions = {
    quality: getQualityFromSearchParams(url, 100)
  };

  return opts;
}

/**
 * Take URL and
 * @param url -
 */
export function pngParams(url: URL): PngOptions {
  const opts: PngOptions = {
    quality: getQualityFromSearchParams(url, 100),
    compressionLevel: 6,
    progressive: false,
    palette: true
  };

  return opts;
}
/**
 * Take URL and
 * @param url -
 */
export function webpParams(url: URL): WebpOptions {
  const opts: WebpOptions = {
    quality: getQualityFromSearchParams(url, 100),
    lossless: false,
    nearLossless: false,
    alphaQuality: 100,
    delay: 0,
    effort: 4,
    force: true,
    loop: 0,
    smartSubsample: false
  };
  return opts;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const outputs: Record<IMaculaFormatOptions, any> = {
  png: pngParams,
  jpeg: jpegParams,
  avif: undefined,
  dz: undefined,
  fits: undefined,
  gif: undefined,
  heif: undefined,
  input: undefined,
  jpg: jpegParams,
  magick: undefined,
  openslide: undefined,
  pdf: undefined,
  ppm: undefined,
  raw: undefined,
  svg: undefined,
  tiff: undefined,
  tif: undefined,
  v: undefined,
  webp: webpParams,
  auto: undefined
};
export default outputs;
