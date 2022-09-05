/* eslint-disable require-atomic-updates */
/* eslint-disable @typescript-eslint/naming-convention */
import { createLogger, Logger } from '@anagolay/utils';
import { SpanStatusType } from '@sentry/tracing';
import { isEmpty } from 'ramda';
import sharp from 'sharp';

import { sentry } from '../sentry';
import { buildConfig } from './imageOperations';
import { getBooleanFromSearchParams } from './outputs';
import toFormat from './toFormat';

export const log: Logger = createLogger({
  name: 'sharp'
});

export interface IProcessedImage {
  data: Buffer;
  mime: string;
  performance: Record<string, string>;
}

/**
 * Process Image using sharp library
 * @param imageBuffer - Image buffer from http request
 * @param imageUrl - Url instance
 * @returns
 */
export default async function processImage(imageBuffer: Buffer, imageUrl: URL): Promise<IProcessedImage> {
  const transaction = sentry.getCurrentHub().getScope()?.getTransaction();

  const startProcessImageTx = transaction?.startChild({
    op: 'sharp-process-image',
    description: 'Use Sharp to process image',
    tags: {
      component: 'sharp'
    }
  });
  // init the sharp instance
  const r = sharp(imageBuffer);

  const buildConfigTX = startProcessImageTx?.startChild({
    op: 'sharp-build-config',
    description: 'Process the Search params to Sharp methods',
    tags: {
      component: 'sharp'
    }
  });
  const config = await buildConfig(imageUrl);
  buildConfigTX?.finish();

  if (!isEmpty(config)) {
    const imageOperations = startProcessImageTx?.startChild({
      op: 'sharp-image-operations',
      description: 'Loop through the config',
      data: {
        config: JSON.stringify(config)
      }
    });
    await Promise.all(
      config.map(async (v) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (r as any)[v.methodName](...v.params);
      })
    );
    imageOperations?.finish();
  }

  const sharpToFormatTx = startProcessImageTx?.startChild({
    op: 'sharp-toFormat',
    description: 'Determine the format and apply to the clone'
  });

  const { mime, sharpInstance } = await toFormat(imageUrl, imageBuffer, r);

  sharpToFormatTx?.finish();

  // include metadata
  /**
   * this made 7px image 50kb and without meta 400b. one approach would be to have the metadata separate stored and referenced in the header under `x-image-meta=bafyCID`
   */
  const includeMetadata = getBooleanFromSearchParams(imageUrl, 'meta', false);
  if (includeMetadata) {
    sharpInstance.withMetadata();
  }
  const sharpToBufferTx = startProcessImageTx?.startChild({
    op: 'sharp-toBuffer',
    description: 'All changes are going to Buffer. All operations are executed.'
  });
  const { data, info } = await sharpInstance.toBuffer({ resolveWithObject: true });

  sharpToBufferTx?.setStatus('ok' as SpanStatusType);
  sharpToBufferTx?.setData('Sharp Info', info);
  sharpToBufferTx?.finish();

  startProcessImageTx?.setData('image-size-before-in-bytes', imageBuffer.length);
  startProcessImageTx?.setData('image-size-after-in-bytes', data.length);
  startProcessImageTx?.setStatus('ok' as SpanStatusType);
  startProcessImageTx?.finish();

  const res: IProcessedImage = { data, mime: mime, performance: {} };

  return res;
}
