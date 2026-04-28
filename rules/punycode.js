export const punycode = {
    name: "Punycode Check",
    startState: 'q0',
    weight: 60,
    acceptedStates: new Set(['q4']),
    transitions: {
        'q0': { 'x': 'q1', '*': 'q0' },
        'q1': { 'n': 'q2', 'x': 'q1', '*': 'q0' },
        'q2': { '-': 'q3', 'x': 'q1', '*': 'q0' },
        'q3': { '-': 'q4', 'x': 'q1', '*': 'q0' },
        'q4': { '*': 'q4' }
    },
    target: 'hostname'
};