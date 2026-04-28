const redirectIndicators = [
    "=http://", 
    "=https://",
    "=//",
    "=javascript:",
    "=data:"
]

function buildDFA(indicators) {
    let transitions = { 'q0': { '*': 'q0' }, 'q_accept': { '*': 'q_accept' } };
    let counter = 1;

    for (let indicator of indicators) {
        let currentState = 'q0';

        for (let index = 0; index < indicator.length; index++) {
            let char = indicator[index];
            let isWordEnd = (index === indicator.length - 1);

            if (!transitions[currentState][char]) {
                let nextState = isWordEnd ? 'q_accept' : `q${counter++}`;

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

export const openRedirect = {
    name: "Indication of Redirection",
    startState: 'q0',
    weight: 45,
    acceptedStates: new Set(['q_accept']),
    transitions: buildDFA(redirectIndicators),
    target: 'search'
}