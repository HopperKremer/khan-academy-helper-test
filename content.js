
// hello is this working
// I like pizza.

let startTime = new Date();
let problemId = window.location.pathname;

// Initialize with any existing time
chrome.runtime.sendMessage({
  type: 'getTimeForProblem',
  problemId: window.location.pathname
}, response => {
  if (response && response.timeSpent) {
    startTime = new Date(Date.now() - response.timeSpent);
  }
});

// Create floating button for quick save
const saveButton = document.createElement('button');
saveButton.innerHTML = '💾 Save Problem';
saveButton.className = 'ka-helper-save-btn';
document.body.appendChild(saveButton);

saveButton.addEventListener('click', () => {
  const problem = {
    id: problemId,
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString(),
    timeSpent: Math.floor((new Date() - startTime) / 1000)
  };

  chrome.storage.local.get(['savedProblems'], (result) => {
    const savedProblems = result.savedProblems || [];
    savedProblems.push(problem);
    chrome.storage.local.set({ savedProblems });
  });
});

// Reset timer when URL changes
let lastUrl = window.location.href;
new MutationObserver(() => {
  if (lastUrl !== window.location.href) {
    lastUrl = window.location.href;
    startTime = new Date();
    problemId = window.location.pathname;
  }
}).observe(document, {subtree: true, childList: true});