const generateTransitions = (chars, targetState) => {
    let t = {};
    for (let char of chars) {
        t[char] = targetState;
    }
    return t;
}

const letters = "abcdefghijklmnopqrstuvwxyz";
const digits = "0123456789";

export const homograph = {
    name: "Homograph Check",
    startState: 'q0',
    weight: 15,
    acceptedStates: new Set(['q_accept']),
    transitions: {
        'q0': { 
            ...generateTransitions(letters, 'q1'), 
            '*': 'q0' 
        },
        'q1': { 
            ...generateTransitions(letters, 'q1'),
            ...generateTransitions(digits, 'q2'),
            '*': 'q0'
        },
        'q2': {
            ...generateTransitions(letters, 'q_accept'),
            ...generateTransitions(digits, 'q2'),
            '*': 'q0'
        },
        'q_accept': { '*': 'q_accept' }
    },
    target: 'hostname'
}