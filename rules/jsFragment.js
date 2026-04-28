import { buildKeywordDFA } from '../utils/keywordDFA.js'

const keywords = [
    "eval", 
    "alert", 
    "document.cookie",
    "fetch",
    "xmlhttprequest"
];

export const jsFragment = {
    name: "Indication of Redirection",
    startState: 'q0',
    weight: 60,
    acceptedStates: new Set(['q_accept']),
    transitions: buildKeywordDFA(keywords),
    target: 'hash'
}