/* eslint-disable @typescript-eslint/explicit-function-return-type */

interface MessageData {
  source: string;
  message: string;
  data: Record<string, string>;
}

/**
 * THIS file will get injected to the url in the tab
 */

const requests: Record<string, MessageData> = {};

function invokeSigning() {
  return 'sig';
}

setTimeout(() => {
  invokeSigning();
}, 2000);

/**
 * Inject the extension and wait
 */
// function inject() {
//   injectExtension(enable, {
//     name: EXTENSION_PREFIX,
//     version: packageVersion
//   });
// }

// setup a response listener (events created by the loader for extension responses)
window.addEventListener('message', (payload): void => {
  console.log(payload);
});
