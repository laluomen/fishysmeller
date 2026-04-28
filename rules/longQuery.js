function buildDFA(length) {
    let transitions = {};

    for (let index = 0; index < length; index++) {
        let currentState = `q${index}`;
        let nextState = `q${index + 1}`;

        transitions[currentState] = { '*': nextState };
    }

    transitions[`q${length}`] = { '*': `q${length}` };
    return transitions;
}

export const longQuery = {
    name: "Very Long String Query",
    startState: 'q0',
    weight: 25,
    acceptedStates: new Set(['q200']),
    transitions: buildDFA(200),
    target: 'search'
}