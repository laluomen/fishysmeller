const digits = (targetState) => {
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
    acceptedStates: new Set(['qa']),
    transitions: {
        'q0': {...digits('q1')},
        'q1': {...digits('q1'), '.': 'q2'},
        'q2': {...digits('q3')},
        'q3': {...digits('q3'), '.': 'q4'},
        'q4': {...digits('q5')},
        'q5': {...digits('q5'), '.': 'q6'},
        'q6': {...digits('qa')},
        'qa' : {...digits('qa')}
    },
    target: 'hostname'
}