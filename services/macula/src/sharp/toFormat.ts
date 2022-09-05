import { FileTypeResult, fromBuffer, MimeType } from 'file-type';
import { isNil } from 'ramda';
import { FormatEnum, Sharp } from 'sharp';

import { getContentTypeFromExtension } from '../utils/mime';
import outputs from './outputs';

interface IFormatReponse {
  mime: MimeType;
  sharpInstance: Sharp;
}

export type IMaculaFormatOptions = keyof FormatEnum | 'auto';

export default async function toFormat(
  url: URL,
  rawImageBuffer: Buffer,
  sharpInstance: Sharp
): Promise<IFormatReponse> {
  const cloned = sharpInstance.clone();

  // if user requests the format to something else than original format, this is the place for the automatic format when implemented
  let mime;

  // console.time('fileTypeDetection');
  const sourceFileMime = (await fromBuffer(rawImageBuffer)) as FileTypeResult;
  // console.timeEnd('fileTypeDetection');

  const userRequestedFormatTo = url.searchParams.get('f');
  // let finalContentType = sourceFileMime.mime;
  if (!isNil(userRequestedFormatTo)) {
    const formatToThis = userRequestedFormatTo as IMaculaFormatOptions;

    switch (formatToThis) {
      case 'auto':
        console.log('auto format is NOT IMPLEMENTED, keeping source extension -- get best mime');
        mime = sourceFileMime.mime;
        break;

      default:
        mime = getContentTypeFromExtension(formatToThis);
        cloned.toFormat(formatToThis, outputs[formatToThis](url));
        break;
    }
  } else {
    // no format is required, keep the original
    mime = sourceFileMime.mime;
  }

  return {
    mime,
    sharpInstance: cloned
  };
}
