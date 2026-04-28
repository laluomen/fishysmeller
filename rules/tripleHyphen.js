export const tripleHyphen = {
    name: "Triple Hyphen Check",
    startState: 'q0',
    weight: 30,
    acceptedStates: new Set(['q3']),
    transitions: {
        'q0': { '-': 'q1', '*': 'q0' },
        'q1': { '-': 'q2', '*': 'q0' },
        'q2': { '-': 'q3', '*': 'q0' },
        'q3': { '*': 'q3' }
    },
    target: 'hostname'
};