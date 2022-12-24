// this file has no access to DOM

import { appName } from '../config';
// this is so TS compile stops bitching
export {};

function getActiveTabs() {
  // queriing the current active tab in the current window should only ever return 1 tab
  // although an array is specified here
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // get the urls of the active tabs. In the case of new tab the url may be empty or undefined
    // we filter these out
    const urls: string[] = tabs.map(({ url }) => url).filter((url) => !!url) as string[];

    const request = {
      id: 'background',
      message: 'pri(activeTabsUrl.update)',
      origin: 'background',
      request: { urls }
    };

    // console.debug('activeTabs', request);
  });
}

chrome.runtime.onConnect.addListener((port): void => {
  console.debug('listening onConnect in bck', port);
  const data = {
    type: '(anagolayJS:testMsg)'
  };
  port.postMessage({ message: 'testing connection from backend to content', data: JSON.stringify(data) });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.debug('[anagolay:gotMessage]', { message, sender });
  chrome.storage.local.set({ accounts: message }).then(() => {
    console.debug('Value is set to ', message);
  });

  return true;
});

chrome.runtime.onInstalled.addListener(async () => {
  // Here goes everything you want to execute after extension initialization

  // await initializeStorageWithDefaults({});

  console.debug(`${appName} Extension successfully installed!`);
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['contentScript.js']
    });
  });
});

// Log storage changes, might be safely removed
chrome.storage.onChanged.addListener((changes) => {
  for (const [key, value] of Object.entries(changes)) {
    console.debug(`"${key}" changed `, { from: value.oldValue, to: value.newValue });
  }
});

// listen to tab updates this is fired on url change
chrome.tabs.onUpdated.addListener((_, changeInfo) => {
  // we are only interested in url change
  if (!changeInfo.url) {
    return;
  }

  getActiveTabs();
});

// the list of active tab changes when switching window
// in a mutli window setup
chrome.windows.onFocusChanged.addListener(() => getActiveTabs());

// when clicking on an existing tab or opening a new tab this will be fired
// before the url is entered by users
chrome.tabs.onActivated.addListener(() => {
  getActiveTabs();
});

// when deleting a tab this will be fired
chrome.tabs.onRemoved.addListener(() => {
  getActiveTabs();
});

// initial setup
// cryptoWaitReady()
//   .then((): void => {
//     console.log('crypto initialized');

//     // load all the keyring data
//     // keyring.loadAll({ store: new AccountsStore(), type: 'sr25519' });

//     console.log('initialization completed');
//   })
//   .catch((error): void => {
//     console.error('initialization failed', error);
//   });
