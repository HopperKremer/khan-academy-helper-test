document.addEventListener('DOMContentLoaded', () => {
    const problemList = document.getElementById('problemList');
    const noteInput = document.getElementById('problemNotes');
    
    // Load saved problems
    function loadSavedProblems() {
      chrome.storage.local.get(['savedProblems', 'notes'], (result) => {
        problemList.innerHTML = '';
        const problems = result.savedProblems || [];
        const notes = result.notes || {};
        
        problems.forEach(problem => {
          const li = document.createElement('li');
          li.innerHTML = `
            <a href="${problem.url}" target="_blank">${problem.title}</a>
            <span>Time: ${formatTime(problem.timeSpent)}</span>
            <p>${notes[problem.id] || ''}</p>
          `;
          problemList.appendChild(li);
        });
      });
    }
  
    // Save notes
    document.getElementById('saveNotes').addEventListener('click', () => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const problemId = new URL(tabs[0].url).pathname;
        chrome.storage.local.get(['notes'], (result) => {
          const notes = result.notes || {};
          notes[problemId] = noteInput.value;
          chrome.storage.local.set({ notes });
        });
      });
    });
  
    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  
    // Update timer
    setInterval(() => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0].url.includes('khanacademy.org')) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: () => {
              return Math.floor((new Date() - window.startTime) / 1000);
            }
          }, (result) => {
            if (result && result[0]) {
              document.getElementById('currentTime').textContent = 
                formatTime(result[0].result);
            }
          });
        }
      });
    }, 1000);
  
    loadSavedProblems();
  });