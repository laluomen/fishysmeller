// content.js — Berjalan di setiap halaman web

(function() {
    const currentURL = window.location.href;
  
    // Kirim URL ke background untuk dianalisis
    chrome.runtime.sendMessage(
      { type: 'ANALYZE_URL', url: currentURL },
      (response) => {
        if (!response) return;
        const result = response.result;
  
        if (result.verdict === 'PHISHING') {
          showWarningBanner(result);
        }
      }
    );
  
    function showWarningBanner(result) {
      const banner = document.createElement('div');
      banner.id = 'phishguard-banner';
      banner.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; z-index: 999999;
        background: #A32D2D; color: white; padding: 12px 20px;
        font-family: sans-serif; font-size: 14px; font-weight: 500;
        display: flex; justify-content: space-between; align-items: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;
      banner.innerHTML = `
        <span>⚠️ PhishGuard: Situs ini terdeteksi sebagai PHISHING 
              (skor: ${result.finalScore}/100)</span>
        <button onclick="this.parentElement.remove()" 
                style="background:transparent;border:1px solid white;
                       color:white;padding:4px 12px;border-radius:4px;
                       cursor:pointer;">Abaikan</button>
      `;
      document.body.prepend(banner);
    }
  })();