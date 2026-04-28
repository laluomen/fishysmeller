// ============================================================
// PhishGuard — background.js
// Implementasi DFA + NFA untuk deteksi URL phishing
// ============================================================

// ============================================================
// DFA ENGINE — Deterministic Finite Automata
// Mendeteksi: format URL, IP address, subdomain mencurigakan,
//             URL encoding berlebihan, path terlalu panjang
// ============================================================

class DFAPhishingDetector {
    constructor() {
      // State DFA
      this.states = {
        START: 0,
        SCHEME: 1,
        DOMAIN: 2,
        SUSPICIOUS: 3,
        ACCEPT: 4,
        REJECT: 5
      };
  
      // Keyword yang sering muncul di domain phishing
      this.suspiciousKeywords = [
        'paypal', 'banking', 'secure', 'login', 'account',
        'update', 'verify', 'confirm', 'signin', 'wallet',
        'ebay', 'amazon', 'apple', 'google', 'microsoft',
        'support', 'helpdesk', 'invoice', 'password', 'credential'
      ];
  
      // Domain brand legitimate yang sering ditiru
      this.legitDomains = [
        'paypal.com', 'google.com', 'facebook.com', 'microsoft.com',
        'apple.com', 'amazon.com', 'netflix.com', 'instagram.com',
        'twitter.com', 'linkedin.com', 'github.com', 'dropbox.com',
        'bca.co.id', 'mandiri.co.id', 'bni.co.id', 'bri.co.id'
      ];
  
      // TLD mencurigakan (bukan list exhaustive, sebagai heuristik tambahan)
      this.suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click', '.loan'];
    }
  
    // Klasifikasi input URL ke "alfabet" DFA
    classifyInput(parsed) {
      const results = {};
      const hostname = parsed.hostname;
  
      // Klasifikasi scheme
      results.scheme = ['https:', 'http:'].includes(parsed.protocol)
        ? 'valid_scheme' : 'invalid_scheme';
  
      // Klasifikasi domain
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
        results.domain = 'ip_address';
      } else if (this.hasSuspiciousSubdomain(hostname)) {
        results.domain = 'suspicious_domain';
      } else {
        results.domain = 'normal_domain';
      }
  
      // Klasifikasi path
      const fullPath = parsed.pathname + parsed.search;
      if (fullPath.length > 200) {
        results.path = 'long_path';
      } else if ((fullPath.match(/%[0-9a-fA-F]{2}/g) || []).length > 5) {
        results.path = 'encoded_path';
      } else {
        results.path = 'clean_path';
      }
  
      return results;
    }
  
    hasSuspiciousSubdomain(hostname) {
      const parts = hostname.split('.');
      if (parts.length <= 2) return false;
      const subdomain = parts.slice(0, -2).join('.').toLowerCase();
      return this.suspiciousKeywords.some(kw => subdomain.includes(kw));
    }
  
    run(url) {
      let score = 0;
      const flags = [];
  
      try {
        const parsed = new URL(url);
        const hostname = parsed.hostname;
        const fullDomain = hostname.replace(/^www\./, '').toLowerCase();
        const input = this.classifyInput(parsed);
  
        // --- DFA State Machine ---
        let currentState = this.states.START;
  
        // Transisi START → SCHEME
        currentState = input.scheme === 'valid_scheme'
          ? this.states.SCHEME : this.states.REJECT;
  
        if (currentState === this.states.SCHEME) {
          // Transisi SCHEME → DOMAIN atau SUSPICIOUS
          if (input.domain === 'ip_address') {
            flags.push({ label: 'IP Address sebagai domain', weight: 35, detail: hostname });
            currentState = this.states.SUSPICIOUS;
          } else if (input.domain === 'suspicious_domain') {
            flags.push({ label: 'Subdomain mengandung keyword brand', weight: 25, detail: hostname });
            currentState = this.states.SUSPICIOUS;
          } else {
            currentState = this.states.DOMAIN;
          }
        }
  
        if (currentState === this.states.DOMAIN) {
          // Transisi DOMAIN → ACCEPT atau SUSPICIOUS
          if (input.path === 'long_path') {
            flags.push({ label: 'URL sangat panjang (>200 karakter)', weight: 15, detail: '' });
            currentState = this.states.SUSPICIOUS;
          } else if (input.path === 'encoded_path') {
            flags.push({ label: 'URL encoding berlebihan (obfuscation)', weight: 20, detail: '' });
            currentState = this.states.SUSPICIOUS;
          } else {
            currentState = this.states.ACCEPT;
          }
        }
  
        // --- Heuristik tambahan DFA ---
  
        // Port tidak standar
        if (parsed.port && !['80', '443', '8080', '8443', ''].includes(parsed.port)) {
          flags.push({ label: 'Port tidak standar', weight: 20, detail: `:${parsed.port}` });
          score += 20;
        }
  
        // Terlalu banyak subdomain (>3 level = suspicious)
        if (hostname.split('.').length > 4) {
          flags.push({ label: 'Terlalu banyak subdomain', weight: 15, detail: '' });
          score += 15;
        }
  
        // Keyword phishing di domain utama
        const foundKw = this.suspiciousKeywords.filter(kw => fullDomain.includes(kw));
        if (foundKw.length > 0) {
          flags.push({
            label: 'Keyword mencurigakan di domain',
            weight: 30,
            detail: foundKw.join(', ')
          });
          score += 30;
        }
  
        // TLD mencurigakan
        const suspTLD = this.suspiciousTLDs.find(tld => hostname.endsWith(tld));
        if (suspTLD) {
          flags.push({ label: `TLD mencurigakan: ${suspTLD}`, weight: 20, detail: '' });
          score += 20;
        }
  
        // @ dalam URL (teknik menyembunyikan domain asli)
        if (url.includes('@')) {
          flags.push({ label: 'Karakter @ di URL (redirect trick)', weight: 40, detail: '' });
          score += 40;
        }
  
        // Double slash setelah domain
        if (/https?:\/\/[^/]+\/\//.test(url)) {
          flags.push({ label: 'Double slash mencurigakan', weight: 15, detail: '' });
          score += 15;
        }
  
        // Skor dari flag state machine
        score += flags.filter(f => f.detail !== undefined && !f._counted).reduce((sum, f) => {
          f._counted = true;
          return sum + f.weight;
        }, 0);
  
        // Recalculate bersih
        score = flags.reduce((sum, f) => sum + f.weight, 0);
  
        return {
          engine: 'DFA',
          score: Math.min(score, 100),
          state: currentState,
          stateName: Object.keys(this.states).find(k => this.states[k] === currentState),
          flags,
          accepted: currentState === this.states.ACCEPT
        };
  
      } catch (e) {
        return {
          engine: 'DFA',
          score: 100,
          state: 5,
          stateName: 'REJECT',
          flags: [{ label: 'URL tidak valid / tidak bisa di-parse', weight: 100, detail: '' }],
          accepted: false
        };
      }
    }
  }
  
  // ============================================================
  // NFA ENGINE — Non-Deterministic Finite Automata
  // Mendeteksi: typosquatting, homoglyph attack,
  //             brand keyword embedding, bit squatting
  // Simulasi NFA = eksplorasi multi-path secara paralel
  // ============================================================
  
  class NFAPhishingDetector {
    constructor() {
      // Peta homoglyph: karakter visual mirip dengan huruf asli
      this.homoglyphMap = {
        'a': ['@', '4', 'а', 'ɑ', 'α', 'а'],  // а = Cyrillic
        'b': ['6', 'ƅ', 'ь', 'β'],
        'c': ['с', 'ϲ', '('],                   // с = Cyrillic
        'd': ['ԁ', 'ɗ'],
        'e': ['3', 'ε', 'е', 'ё'],              // е = Cyrillic
        'g': ['9', 'ɡ', 'ƍ'],
        'h': ['н', 'ħ'],                         // н = Cyrillic
        'i': ['1', 'l', '|', 'і', 'ı', '!'],   // і = Cyrillic
        'k': ['κ', 'к'],                         // к = Cyrillic
        'l': ['1', 'I', '|', 'ℓ', 'ӏ'],
        'm': ['м', 'rn'],                        // м = Cyrillic
        'n': ['п', 'ñ'],                         // п = Cyrillic
        'o': ['0', 'ο', 'о', 'ø', 'σ', 'о'],  // о = Cyrillic, ο = Greek
        'p': ['р', 'ρ'],                         // р = Cyrillic
        'q': ['ԛ', 'զ'],
        'r': ['г', 'ɾ'],                         // г = Cyrillic
        's': ['5', '$', 'ѕ', 'ś'],
        't': ['т', '+'],                          // т = Cyrillic
        'u': ['ʋ', 'υ', 'ü', 'µ'],
        'v': ['ν', 'υ', 'ѵ'],
        'w': ['ω', 'ѡ', 'vv'],
        'x': ['х', '×'],                          // х = Cyrillic
        'y': ['у', 'ý', 'ÿ'],                   // у = Cyrillic
        'z': ['2', 'ż', 'ź']
      };
  
      // Brand target phishing yang umum
      this.targetBrands = [
        { domain: 'paypal', tld: 'com' },
        { domain: 'google', tld: 'com' },
        { domain: 'facebook', tld: 'com' },
        { domain: 'microsoft', tld: 'com' },
        { domain: 'apple', tld: 'com' },
        { domain: 'amazon', tld: 'com' },
        { domain: 'netflix', tld: 'com' },
        { domain: 'instagram', tld: 'com' },
        { domain: 'twitter', tld: 'com' },
        { domain: 'linkedin', tld: 'com' },
        { domain: 'github', tld: 'com' },
        { domain: 'dropbox', tld: 'com' },
        { domain: 'ebay', tld: 'com' },
        { domain: 'steam', tld: 'com' },
        { domain: 'roblox', tld: 'com' },
        { domain: 'yahoo', tld: 'com' },
        { domain: 'outlook', tld: 'com' },
        { domain: 'office', tld: 'com' },
        { domain: 'bca', tld: 'co.id' },
        { domain: 'mandiri', tld: 'co.id' },
        { domain: 'bni', tld: 'co.id' },
        { domain: 'bri', tld: 'co.id' },
        { domain: 'tokopedia', tld: 'com' },
        { domain: 'shopee', tld: 'co.id' }
      ];
    }
  
    // Normalisasi: ganti semua homoglyph ke karakter asli
    // Ini mensimulasikan epsilon-closure NFA terhadap karakter visual
    normalizeHomoglyphs(str) {
      let normalized = str.toLowerCase();
      for (const [original, variants] of Object.entries(this.homoglyphMap)) {
        for (const variant of variants) {
          try {
            normalized = normalized.split(variant).join(original);
          } catch(e) {}
        }
      }
      return normalized;
    }
  
    // Levenshtein Distance
    // Simulasi NFA: setiap sel DP = satu "state" paralel yang dieksplorasi
    // O(m*n) — mensimulasikan semua kemungkinan edit path secara bersamaan
    levenshtein(s1, s2) {
      const m = s1.length, n = s2.length;
      // dp[i][j] = state: biaya minimum mengubah s1[0..i] → s2[0..j]
      const dp = [];
      for (let i = 0; i <= m; i++) {
        dp[i] = [];
        for (let j = 0; j <= n; j++) {
          if (i === 0) dp[i][j] = j;
          else if (j === 0) dp[i][j] = i;
          else dp[i][j] = 0;
        }
      }
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (s1[i - 1] === s2[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1]; // epsilon transition (match)
          } else {
            dp[i][j] = 1 + Math.min(
              dp[i - 1][j],     // delete
              dp[i][j - 1],     // insert
              dp[i - 1][j - 1]  // replace
            );
          }
        }
      }
      return dp[m][n];
    }
  
    // Deteksi bit-squatting: domain berbeda 1 karakter dengan brand
    isBitSquatting(input, brand) {
      if (Math.abs(input.length - brand.length) > 1) return false;
      let diffs = 0;
      for (let i = 0; i < Math.min(input.length, brand.length); i++) {
        if (input[i] !== brand[i]) diffs++;
      }
      return diffs === 1 && input.length === brand.length;
    }
  
    // Simulasi NFA: eksplorasi multi-path paralel
    // Setiap "path" adalah strategi serangan yang berbeda
    simulateNFA(inputDomain) {
      const normalized = this.normalizeHomoglyphs(inputDomain);
      const flags = [];
      let maxScore = 0;
  
      for (const brand of this.targetBrands) {
        // === PATH 1: Homoglyph attack (epsilon transitions) ===
        if (normalized === brand.domain && inputDomain !== brand.domain) {
          const f = {
            label: `Homoglyph Attack: "${inputDomain}" → menyerupai "${brand.domain}"`,
            weight: 85,
            path: 'homoglyph',
            detail: `Karakter Unicode visual mirip digunakan`
          };
          flags.push(f);
          maxScore = Math.max(maxScore, 85);
          continue;
        }
  
        // === PATH 2: Levenshtein typosquatting ===
        const editDist = this.levenshtein(normalized, brand.domain);
        const threshold = Math.max(1, Math.floor(brand.domain.length * 0.25));
  
        if (editDist > 0 && editDist <= threshold) {
          const similarity = 1 - (editDist / Math.max(normalized.length, brand.domain.length));
          const weight = Math.round(similarity * 75);
          if (weight > 20) {
            flags.push({
              label: `Typosquatting: "${inputDomain}" mirip "${brand.domain}.${brand.tld}" (edit distance: ${editDist})`,
              weight,
              path: 'levenshtein',
              detail: `Similarity: ${Math.round(similarity * 100)}%`
            });
            maxScore = Math.max(maxScore, weight);
          }
        }
  
        // === PATH 3: Brand embedding / sandwich attack ===
        // Misal: paypal-secure.evil.com atau secure-paypal.com
        if (normalized.includes(brand.domain) && normalized !== brand.domain) {
          flags.push({
            label: `Brand Embedding: "${brand.domain}" disisipkan dalam domain "${inputDomain}"`,
            weight: 65,
            path: 'embedding',
            detail: `Teknik untuk menipu pengguna`
          });
          maxScore = Math.max(maxScore, 65);
        }
  
        // === PATH 4: Bit-squatting ===
        if (this.isBitSquatting(inputDomain.toLowerCase(), brand.domain)) {
          flags.push({
            label: `Bit Squatting: "${inputDomain}" berbeda 1 karakter dari "${brand.domain}"`,
            weight: 60,
            path: 'bitsquat',
            detail: `Memory bit-flip exploit`
          });
          maxScore = Math.max(maxScore, 60);
        }
  
        // === PATH 5: Vowel/consonant swap ===
        const vowelSwapped = inputDomain.toLowerCase()
          .replace(/[aeiou]/g, 'x');
        const brandVowelSwapped = brand.domain.replace(/[aeiou]/g, 'x');
        if (vowelSwapped === brandVowelSwapped && inputDomain.toLowerCase() !== brand.domain) {
          flags.push({
            label: `Vowel Swap Attack: "${inputDomain}" → penggantian huruf vokal`,
            weight: 50,
            path: 'vowelswap',
            detail: ''
          });
          maxScore = Math.max(maxScore, 50);
        }
      }
  
      return {
        engine: 'NFA',
        score: Math.min(maxScore, 100),
        flags,
        paths: [...new Set(flags.map(f => f.path))].filter(Boolean)
      };
    }
  
    run(url) {
      try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.replace(/^www\./, '');
        // Ambil hanya bagian domain (tanpa TLD terakhir)
        const parts = hostname.split('.');
        const domainOnly = parts.length >= 2
          ? parts.slice(0, -1).join('.')
          : hostname;
        return this.simulateNFA(domainOnly);
      } catch {
        return { engine: 'NFA', score: 0, flags: [], paths: [] };
      }
    }
  }
  
  // ============================================================
  // VERDICT ENGINE — Gabungkan hasil DFA + NFA
  // ============================================================
  
  const dfa = new DFAPhishingDetector();
  const nfa = new NFAPhishingDetector();
  
  function analyzeURL(url) {
    // Skip URL internal browser
    if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://') ||
        url.startsWith('about:') || url.startsWith('edge://') || url.startsWith('moz-extension://')) {
      return {
        url,
        finalScore: 0,
        verdict: 'SAFE',
        color: '#1D9E75',
        dfa: { engine: 'DFA', score: 0, flags: [], stateName: 'ACCEPT' },
        nfa: { engine: 'NFA', score: 0, flags: [], paths: [] },
        allFlags: [],
        skipped: true
      };
    }
  
    const dfaResult = dfa.run(url);
    const nfaResult = nfa.run(url);
  
    // Bobot: DFA 40% + NFA 60%
    // NFA lebih berat karena serangan visual lebih berbahaya dan sulit dideteksi manusia
    const finalScore = Math.min(
      Math.round(dfaResult.score * 0.4 + nfaResult.score * 0.6),
      100
    );
  
    let verdict, color;
    if (finalScore >= 70) {
      verdict = 'PHISHING';
      color = '#A32D2D';
    } else if (finalScore >= 30) {
      verdict = 'SUSPICIOUS';
      color = '#854F0B';
    } else {
      verdict = 'SAFE';
      color = '#0F6E56';
    }
  
    return {
      url,
      finalScore,
      verdict,
      color,
      dfa: dfaResult,
      nfa: nfaResult,
      allFlags: [...dfaResult.flags, ...nfaResult.flags],
      timestamp: Date.now()
    };
  }
  
  // ============================================================
  // MESSAGE HANDLER — Menerima request dari content script / popup
  // ============================================================
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ANALYZE_URL') {
      try {
        const result = analyzeURL(message.url);
        sendResponse({ result });
      } catch (e) {
        sendResponse({ result: null, error: e.message });
      }
    }
    return true; // penting: izinkan async response
  });
  
  // ============================================================
  // AUTO-DETECT saat navigasi halaman baru
  // ============================================================
  
  chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId !== 0) return; // hanya main frame
  
    const result = analyzeURL(details.url);
    if (result.skipped) return;
  
    // Simpan hasil ke session storage (per-tab)
    chrome.storage.session.set({
      [`tab_${details.tabId}`]: result
    }).catch(() => {});
  
    // Update icon berdasarkan verdict
    const iconMap = {
      'SAFE': { '16': 'icons/icon16.png', '48': 'icons/icon48.png' },
      'SUSPICIOUS': { '16': 'icons/icon16-warn.png', '48': 'icons/icon48-warn.png' },
      'PHISHING': { '16': 'icons/icon16-danger.png', '48': 'icons/icon48-danger.png' }
    };
  
    // Gunakan icon default jika icon khusus tidak ada
    try {
      chrome.action.setIcon({
        tabId: details.tabId,
        path: iconMap[result.verdict] || iconMap['SAFE']
      }).catch(() => {});
    } catch(e) {}
  
    // Badge text menampilkan skor
    chrome.action.setBadgeText({
      tabId: details.tabId,
      text: result.verdict === 'SAFE' ? '' : String(result.finalScore)
    }).catch(() => {});
  
    chrome.action.setBadgeBackgroundColor({
      tabId: details.tabId,
      color: result.color
    }).catch(() => {});
  
  }, { url: [{ schemes: ['http', 'https'] }] });