export const deepPath = {
    name: "Too Deep Paths",
    startState: 'q0',
    weight: 30,
    acceptedStates: new Set(['q7']),
    transitions: {
        'q0': { '/': 'q1', '*': 'q0' },
        'q1': { '/': 'q2', '*': 'q1' },
        'q2': { '/': 'q3', '*': 'q2' },
        'q3': { '/': 'q4', '*': 'q3' },
        'q4': { '/': 'q5', '*': 'q4' },
        'q5': { '/': 'q6', '*': 'q5' },
        'q6': { '/': 'q7', '*': 'q6' },
        'q7': { '*': 'q7' }
    },
    target: 'pathname'
}