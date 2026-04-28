const keywords = [
    "login", "signin", "secure", "update", "verify", 
    "billing", "invoice", "checkout", "wallet", "payment",
    "recover", "unlock", "restore", "auth", "confirm"
];

function buildDFA(wordList) {
    let transitions = {
        'q0': { '*': 'q0' },
        'q_accept': { '*': 'q_accept' }
    };

    let counter = 1;

    for (let word of wordList) {
        let currentState = 'q0';

        for (let index = 0; index < word.length; index++) {
            let char = word[index];
            let isWordEnd = (index === word.length - 1);

            if (!transitions[currentState][char]) {
                let nextState = isWordEnd ? 'q_accept' : `q_${counter++}`;

                transitions[currentState][char] = nextState;

                if (!transitions[nextState]) {
                    transitions[nextState] = { '*': 'q0' };
                }
            } else if (isWordEnd) {
                transitions[currentState][char] = 'q_accept';
            }

            currentState = transitions[currentState][char];
        }
    }

    return transitions;
}

export const pathKeywords = {
    name: "Sensitive Keywords Check",
    startState: 'q0',
    weight: 25,
    acceptedStates: new Set(['q_accept']),
    transitions: buildDFA(keywords),
    target: 'pathname'
}