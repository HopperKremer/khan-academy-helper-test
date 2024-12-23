//h
document.addEventListener('DOMContentLoaded', () => {
    const problemList = document.getElementById('problemList');
    const noteInput = document.getElementById('problemNotes');

    function displaySavedProblems(problems) {
      const problemList = document.getElementById('problemList');
      problemList.innerHTML = '';
      
      problems.forEach((problem, index) => {
        const li = document.createElement('li');
        
        const problemText = document.createElement('span');
        problemText.textContent = problem.title || problem.url;
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = () => deleteProblem(index);
        
        li.appendChild(problemText);
        li.appendChild(deleteButton);
        problemList.appendChild(li);
      });
    }
    
    function deleteProblem(index) {
      chrome.storage.local.get(['savedProblems'], function(result) {
        const problems = result.savedProblems || [];
        displaySavedProblems(problems);
        problems.splice(index, 1);
        chrome.storage.local.set({ savedProblems: problems }, function() {
          displaySavedProblems(problems);
        });
      });
    }
    // Load saved problems
    function loadSavedProblems() {
      chrome.storage.local.get(['savedProblems', 'notes'], (result) => {
        const problems = result.savedProblems || [];
        displaySavedProblems(problems);
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
