export const longDomain = {
    name: "Holy Long Domain",
    startState: 'q0',
    weight: 40,
    acceptedStates: new Set(['q3']),
    transitions: {
        'q0': { '.': 'q1', '*': 'q0' },
        'q1': { '.': 'q2', '*': 'q1' },
        'q2': { '.': 'q3', '*': 'q2' },
        'q3': { '*': 'q3' }
    },
    target: 'hostname'
}