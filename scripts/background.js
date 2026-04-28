import { Detector } from '../utils/engine.js'

import { base64Param } from '../rules/base64Param.js'
import { deepPath } from '../rules/deepPath.js'
import { homograph } from '../rules/homograph.js'
import { httpSchema } from '../rules/httpSchema.js'
import { ipAddress } from '../rules/ipAddress.js'
import { jsFragment } from '../rules/jsFragment.js'
import { longDomain } from '../rules/longDomain.js'
import { longQuery } from '../rules/longQuery.js'
import { nonStandardSchema } from '../rules/nonStandardSchema.js'
import { openRedirect } from '../rules/openRedirect.js'
import { pathKeywords } from '../rules/pathKeywords.js'
import { punycode } from '../rules/punycode.js'
import { randomDigits } from '../rules/randomDigits.js'
import { rareTld } from '../rules/rareTld.js'
import { tripleHyphen } from '../rules/tripleHyphen.js'

const engine = new Detector([
    base64Param, deepPath, homograph, httpSchema, ipAddress,
    jsFragment, longDomain, longQuery, nonStandardSchema, openRedirect,
    pathKeywords, punycode, randomDigits, rareTld, tripleHyphen
]);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        const url = changeInfo.url;

        if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
            return;
        }

        const result = engine.analyze(url);

        chrome.storage.local.set({ [tabId]: result });

        if (result.isDanger) {
            chrome.action.setBadgeBackgroundColor({ color: '#FF0000', tabId: tabId });
            chrome.action.setBadgeText({ text: 'DANGER', tabId: tabId });
        } else if (result.isRisk) {
            chrome.action.setBadgeBackgroundColor({ color: '#FFA500', tabId: tabId });
            chrome.action.setBadgeText({ text: 'RISK', tabId: tabId });
        } else {
            chrome.action.setBadgeText({ text: '', tabId: tabId });
        }
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.storage.local.remove(tabId.toString());
});