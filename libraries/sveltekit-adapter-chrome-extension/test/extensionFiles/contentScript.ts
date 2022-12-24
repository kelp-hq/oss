/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/typedef */
/**
 * THE CONTENT JS FILE, THIS GETS INCLUDED STRAIGHT ON THE APP START, OUR WAY OF COMMUNICATION WITH THE INJECTED APP
 */

// https://groups.google.com/a/chromium.org/g/chromium-extensions/c/04X0XNJKESI

import { MESSAGE_ORIGIN_CONTENT, PORT_CONTENT } from '@polkadot/extension-base/defaults';

import { documentReadyPromise } from '../utils';
console.debug('PORT IS ', PORT_CONTENT);
import { chrome } from '@polkadot/extension-inject/chrome';

// // connect to the extension
// // https://developer.chrome.com/docs/extensions/mv3/messaging/
export const port = chrome.runtime.connect({ name: PORT_CONTENT }); // long lived conns

// send any messages from the extension back to the page
port.onMessage.addListener((data): void => {
  console.debug('posting message', { ...data, origin: MESSAGE_ORIGIN_CONTENT });
  window.postMessage({ ...data, origin: MESSAGE_ORIGIN_CONTENT }, '*');
});

// // all messages from the page, pass them to the extension
// window.addEventListener(
//   'message',
//   (event) => {
//     // We only accept messages from ourselves
//     console.debug('[anagolay::IN::content::message-event]', event.data);
//     if (event.source !== window) {
//       return;
//     }

//     if (event.data.type && event.data.type === 'FROM_PAGE') {
//       console.debug('Content script received: ' + event.data.text);
//       port.postMessage(event.data.text);
//     }
//   },
//   false
// );

// window.addEventListener(
//   'PassToContentScript',
//   function (evt: any) {
//     console.debug('PassToContentScript evt', evt);
//     // https://developer.chrome.com/docs/extensions/mv3/messaging/
//     chrome.runtime.sendMessage(evt.detail); // single one-time request
//   },
//   false
// );

// inject our page that will have access to the Website DOM and send messages to our Extension
documentReadyPromise<string>(() => {
  return new Promise((res, rej) => {
    res('84');
  });
}).then((r) => {
  console.log('document.readyState', r);
});

setTimeout(() => {
  // document.body.style.backgroundColor = 'orange';
}, 1000);
const script = document.createElement('script');
const injectedScriptPath = 'src/extensionFiles/anagolayInjectedPage.js';
script.src = chrome.runtime.getURL(injectedScriptPath);
script.type = 'module';
script.crossOrigin = '';

script.onload = (): void => {
  // remove the injecting tag when loaded
  if (script.parentNode) {
    script.parentNode.removeChild(script);
  }
};

(document.head || document.documentElement).appendChild(script);
