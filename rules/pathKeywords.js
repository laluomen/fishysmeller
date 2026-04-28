import { buildKeywordDFA } from '../utils/keywordDFA.js'

const keywords = [
    "login", "signin", "secure", "update", "verify", 
    "billing", "invoice", "checkout", "wallet", "payment",
    "recover", "unlock", "restore", "auth", "confirm"
];

export const pathKeywords = {
    name: "Sensitive Keywords Check",
    startState: 'q0',
    weight: 25,
    acceptedStates: new Set(['q_accept']),
    transitions: buildKeywordDFA(keywords),
    target: 'pathname'
}