import init, { Workflow } from 'wf_cidv1_from_array';
import wasm from 'wf_cidv1_from_array/wf_cidv1_from_array_bg.wasm?url';
/**
 * A simple wrapper for Anagolay CID Workflow that is using the TextEncoder to create a Uint8Array, optimized for the Web. It also init the wasm
 * @param data - Any string
 * @returns
 */
export async function calculateCid(data: string | Uint8Array): Promise<string> {
  console.time('[an-wf:wasm-init]');
  await init(wasm);
  console.timeEnd('[an-wf:wasm-init]');

  let input: Uint8Array;

  /**
   * Here we create our workflow and calc the cid in ~1 ms
   */
  const start = new Date().getTime();
  const wf = new Workflow();
  if (typeof data === 'string') {
    const te = new TextEncoder();
    input = te.encode(data);
  } else {
    input = data;
  }

  const { output } = await wf.next([input]);
  const elapsedTime = new Date().getTime() - start + ' ms';
  console.log('cid calculation: %s -> %s', output, elapsedTime);

  return output;
}
