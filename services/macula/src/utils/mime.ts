import { MimeType } from 'file-type';
import * as mime from 'mime-types';

/**
 * Get correct mime type for the browser and the file
 * @param extension - A file extension, like png or jpeg
 * @public
 */
export function getContentTypeFromExtension(extension: string): MimeType {
  const resolvedType = mime.lookup(extension);
  if (!resolvedType) {
    throw new Error(`Cannot infer the content type for ${extension}`);
  } else {
    return resolvedType as MimeType;
  }
}
