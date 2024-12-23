// Hello can you see this?
let activeTabTime = {};
let currentTabId = null;
let isTracking = false;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  handleTabChange(tab);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    handleTabChange(tab);
  }
});

async function handleTabChange(tab) {
  if (currentTabId && isTracking) {
    const timeSpent = Date.now() - activeTabTime[currentTabId];
    await saveTimeToStorage(currentTabId, timeSpent);
  }

  if (tab.url && tab.url.includes('khanacademy.org')) {
    currentTabId = tab.id;
    activeTabTime[currentTabId] = Date.now();
    isTracking = true;
  } else {
    isTracking = false;
  }
}

async function saveTimeToStorage(tabId, timeSpent) {
  const data = await chrome.storage.local.get(['problemTimes']);
  const problemTimes = data.problemTimes || {};
  const tab = await chrome.tabs.get(tabId);
  const problemId = new URL(tab.url).pathname;
  
  problemTimes[problemId] = (problemTimes[problemId] || 0) + timeSpent;
  await chrome.storage.local.set({ problemTimes });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['savedProblems', 'notes', 'problemTimes'], (result) => {
    if (!result.savedProblems) chrome.storage.local.set({ savedProblems: [] });
    if (!result.notes) chrome.storage.local.set({ notes: {} });
    if (!result.problemTimes) chrome.storage.local.set({ problemTimes: {} });
  });
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === currentTabId && isTracking) {
    const timeSpent = Date.now() - activeTabTime[currentTabId];
    await saveTimeToStorage(tabId, timeSpent);
    delete activeTabTime[tabId];
    isTracking = false;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getTimeForProblem') {
    chrome.storage.local.get(['problemTimes'], (result) => {
      const times = result.problemTimes || {};
      sendResponse({ timeSpent: times[request.problemId] || 0 });
    });
    return true;
  }
});