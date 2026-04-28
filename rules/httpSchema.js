export const httpSchema = {
    name: "Insecure HTTP Protocol",
    startState: 'q0',
    weight: 40,
    acceptedStates: new Set(['q8']),
    transitions: {
        'q0': { 'h': 'q1' },
        'q1': { 't': 'q2' },
        'q2': { 't': 'q3' },
        'q3': { 'p': 'q4' },
        'q4': { ':': 'q5', 's': 'q7' }, 
        'q5': { '/': 'q6' },
        'q6': { '/': 'q8' },
        'q7': { '*': 'q7' },
        'q8': { '*': 'q8' }
    },
    target: 'full'
};