// background.js

const STORAGE_KEY = 'proxyEnabled';
const PROXY_CONFIG = {
  mode: 'fixed_servers',
  rules: {
    singleProxy: {
      scheme: 'http',
      host: '127.0.0.1',
      port: 8080
    },
    bypassList: ['<local>', 'localhost', '127.0.0.1']
  }
};

async function getState() {
  const { [STORAGE_KEY]: state } = await chrome.storage.local.get(STORAGE_KEY);
  return state ?? false;
}

async function setState(enabled) {
  await chrome.storage.local.set({ [STORAGE_KEY]: enabled });
  if (enabled) {
    await chrome.proxy.settings.set({ value: PROXY_CONFIG, scope: 'regular' });
    await setBadge('ON', '#27ae60');
  } else {
    await chrome.proxy.settings.clear({ scope: 'regular' });
    await setBadge('', '#00000000');
  }
}

async function setBadge(text, color) {
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color });
}

// --- Toggle on icon click ---
chrome.action.onClicked.addListener(async () => {
  const current = await getState();
  await setState(!current);
});

// --- Toggle via keyboard shortcut ---
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-proxy') {
    const current = await getState();
    await setState(!current);
  }
});

// --- Initialize state on startup ---
chrome.runtime.onStartup.addListener(async () => {
  const current = await getState();
  await setState(current);
});

chrome.runtime.onInstalled.addListener(async () => {
  const current = await getState();
  await setState(current);
});
