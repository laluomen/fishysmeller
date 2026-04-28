function renderUI(result) {
    const statusText = document.getElementById('status-text');
    const scoreText = document.getElementById('score-text');
    const rulesContainer = document.getElementById('rules-container');
    const safeMessage = document.getElementById('safe-message');

    scoreText.textContent = `Skor: ${result.riskScore}/100`;

    if (result.isDanger) {
        statusText.textContent = 'DANGER';
        statusText.className = 'text-danger';
    } else if (result.isRisk) {
        statusText.textContent = 'SUSPICIOUS';
        statusText.className = 'text-warning';
    } else {
        statusText.textContent = 'SAFE';
        statusText.className = 'text-safe';
    }

    if (result.details.length > 0) {
        safeMessage.style.display = 'none';

        result.details.forEach(rule => {
            const card = document.createElement('div');
            card.className = 'rule-card';

            card.innerHTML = `
            <div class="rule-header">
                <span class="rule-name">${rule.name}</span>
                <span class="dfa-badge">DFA</span>
            </div>
            <div class="rule-points">+${rule.weight} poin</div>
            `;

            rulesContainer.appendChild(card);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];

        document.getElementById('url-display').textContent = currentTab.url;

        chrome.storage.local.get(currentTab.id.toString(), (data) => {
            const result = data[currentTab.id];

            if (result) {
                renderUI(result);
            } else {
                renderUI({
                    isRisk: false,
                    isDanger: false,
                    riskScore: 0,
                    details: []
                })
            }
        });
    });
});