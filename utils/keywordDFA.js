export function buildKeywordDFA(wordList) {
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