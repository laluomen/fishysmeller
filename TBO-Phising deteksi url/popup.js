// popup.js
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];
    const urlDisplay = document.getElementById('url-display');
    const resultArea = document.getElementById('result-area');
  
    urlDisplay.textContent = tab.url;
  
    chrome.runtime.sendMessage(
      { type: 'ANALYZE_URL', url: tab.url },
      (response) => {
        if (!response) return;
        const r = response.result;
  
        const colors = {
          'SAFE': '#1D9E75', 'SUSPICIOUS': '#BA7517', 'PHISHING': '#A32D2D'
        };
        const color = colors[r.verdict];
  
        let flagsHTML = r.allFlags.length === 0
          ? '<p style="color:#999;font-size:12px">Tidak ada tanda bahaya</p>'
          : r.allFlags.map(f => `
              <div class="flag-item">
                <span class="flag-label">${f.label}</span>
                <span class="engine-badge ${f.path ? 'nfa' : 'dfa'}">
                  ${f.path ? 'NFA' : 'DFA'}
                </span>
                <div style="color:#666;margin-top:4px">+${f.weight} poin</div>
              </div>
            `).join('');
  
        resultArea.innerHTML = `
          <div class="verdict" style="color:${color}">${r.verdict}</div>
          <div style="text-align:center;color:#666;font-size:13px;margin-bottom:12px">
            Skor: <strong style="color:${color}">${r.finalScore}</strong>/100
          </div>
          <div style="display:flex;gap:8px;margin-bottom:12px">
            <div style="flex:1;background:#f0f0f0;border-radius:6px;padding:8px;
                        text-align:center;font-size:11px">
              <div style="font-weight:600;color:#185FA5">DFA Score</div>
              <div style="font-size:18px;color:#185FA5">${r.dfa.score}</div>
            </div>
            <div style="flex:1;background:#f0f0f0;border-radius:6px;padding:8px;
                        text-align:center;font-size:11px">
              <div style="font-weight:600;color:#993C1D">NFA Score</div>
              <div style="font-size:18px;color:#993C1D">${r.nfa.score}</div>
            </div>
          </div>
          <div class="flags">${flagsHTML}</div>
        `;
      }
    );
  });