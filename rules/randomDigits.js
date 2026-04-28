const digits = "0123456789";
const generateTransitions = (chars, targetState) => {
    let t = {};
    for (let char of chars) {
        t[char] = targetState;
    }

    return t;
}

export const randomDigits = {
    name: "Many Consecutive Random Digits",
    startState: 'q0',
    weight: 20,
    acceptedStates: new Set(['q5']),
    transitions: {
        'q0': { ...generateTransitions(digits, 'q1'), '*': 'q0' },
        'q1': { ...generateTransitions(digits, 'q2'), '*': 'q0' },
        'q2': { ...generateTransitions(digits, 'q3'), '*': 'q0' },
        'q3': { ...generateTransitions(digits, 'q4'), '*': 'q0' },
        'q4': { ...generateTransitions(digits, 'q5'), '*': 'q0' },
        'q5': { '*': 'q5' }
    },
    target: 'pathname'
}