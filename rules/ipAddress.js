const generateDigits = (targetState) => {
    let t = {};
    for (let index = 0; index < 10; index++) {
        t[index.toString()] = targetState;
    }
    return t;
}

export const ipAddress = {
    name: "Bare IP Address as Domain",
    startState: 'q0',
    weight: 80,
    acceptedStates: new Set(['q_accept']),
    transitions: {
        'q0': {...generateDigits('q1')},
        'q1': {...generateDigits('q1'), '.': 'q2'},
        'q2': {...generateDigits('q3')},
        'q3': {...generateDigits('q3'), '.': 'q4'},
        'q4': {...generateDigits('q5')},
        'q5': {...generateDigits('q5'), '.': 'q6'},
        'q6': {...generateDigits('qa')},
        'q_accept' : {...generateDigits('q_accept')}
    },
    target: 'hostname'
}