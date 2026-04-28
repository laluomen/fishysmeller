const base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function buildDFA(length) {
    let transitions = {};

    for (let index = 0; index <= length; index++) {
        let currentState = `q${index}`;
        let nextState = (index === length) ? 'q_accept' : `q${index + 1}`;

        transitions[currentState] = { '*': 'q0' };

        for (let char of base64) {
            transitions[currentState][char] = nextState;
        }

        if (index >= length - 2) {
            transitions[currentState]['='] = 'q_accept';
        }
    }

    transitions['q_accept'] = { '*': 'q_accept' };
    return transitions;
}

export const base64Param = {
    name: "Base64 Encoded Parameters",
    startState: 'q0',
    weight: 35,
    acceptedStates: new Set(['q_accept']),
    transitions: buildDFA(40),
    target: 'search'
}