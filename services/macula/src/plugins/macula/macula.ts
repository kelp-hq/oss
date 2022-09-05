import { Workflow as WorkflowCreateCidFirst } from '@anagolay/create_cid_from_buffer';
import axios from 'axios';
import { isNil, last, split } from 'ramda';

import { sentry } from '../../sentry';
import processImage, { IProcessedImage } from '../../sharp/sharp';
import { removeSearchParamsFromUrl } from './utils';

export interface IMaculaReturn {
  image: IProcessedImage;
  originalCid: string;
  renditionCid: string;
  extraHeaders?: Record<string, string>;
}

/**
 * Main macula entrypoint. it should be implementation agnostic.
 */
export default async function macula(imageUrl: URL): Promise<IMaculaReturn> {
  const transaction = sentry.getCurrentHub().getScope()?.getTransaction();

  const { data, headers } = await axios.get<Buffer>(removeSearchParamsFromUrl(imageUrl), {
    responseType: 'arraybuffer',
    headers: {}
  });

  // Here is where processing starts
  const image = await processImage(data, imageUrl);

  /**
   * looks like this `'x-ipfs-roots': 'bafybeibnrdywswirnkzdcjafhpskcjwft3w3ur5gvvat2ifrjcgzmqnyae,bafybeifd7swbzmbgkyvaao2ny3yjfl7oxgzkex6s2gse76272iwi5eegxe'`
   *
   * **/
  let cid = last(split(',', headers['x-ipfs-roots']));

  if (isNil(cid)) {
    sentry.captureException(
      `cannot get the CID from the ipfs gateway, the x-ipfs-roots are malformed, defaulting to empty string -- roots ${headers['x-ipfs-roots']}`
    );
    console.error(
      'cannot get the CID from the ipfs gateway, the x-ipfs-roots are malformed, defaulting to empty string ',
      headers['x-ipfs-roots']
    );
    cid = '';
  }

  // Create the instance of the Cid workflow
  // const startWf = transaction?.startChild({
  //   op: 'cid-workflowSerde',
  //   description: 'Use Anagolay workflow to calculate CID'
  // });

  // const workflowSerde = new WorkflowCreateCidWithSerde();
  // const { output: workflowSerdeRenditionCid } = await workflowSerde.next([image.data]);
  // startWf?.setData('input-size-in-bytes', image.data.length);
  // startWf?.finish();

  // Create the instance of the Cid workflow
  const startWfFirstTx = transaction?.startChild({
    op: 'cid-workflowFirst',
    description: 'Use Anagolay workflow to calculate CID'
  });
  const workflowFirst = new WorkflowCreateCidFirst();
  const { output: workflowFirstRenditionCid } = await workflowFirst.next([image.data]);
  startWfFirstTx?.setData('input-size-in-bytes', image.data.length);
  startWfFirstTx?.finish();

  // const startWfNewBincodeTx = transaction?.startChild({
  //   op: 'cid-workflowBincodeLast',
  //   description: 'Use Anagolay workflow to calculate CID'
  // });
  // const workflowNewBincode = new WorkflowCreateCidNewBincode();
  // const { output: workflowNewBincodeRenditionCid } = await workflowNewBincode.next([image.data]);
  // startWfNewBincodeTx?.setData('input-size-in-bytes', image.data.length);
  // startWfNewBincodeTx?.finish();

  return {
    image,
    originalCid: cid,
    renditionCid: workflowFirstRenditionCid,
    extraHeaders: {
      // 'x-kelp-cid-rendition-first-wf': workflowFirstRenditionCid,
      // 'x-kelp-cid-rendition-serde-wf': workflowSerdeRenditionCid,
      // 'x-kelp-cid-rendition-bincode-wf': workflowNewBincodeRenditionCid
    }
  };
}
