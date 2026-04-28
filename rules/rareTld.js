export const rareTld = {
    name: "Rare Suspicious Top-level Domain",
    startState: 'q0',
    weight: 45,
    acceptedStates: new Set(['q_accept']),
    transitions: {
        'q0': { '.': 'q_dot', '*': 'q0' },
        'q_dot': { 
            'x': 'q_x', 't': 'q_t', 'z': 'q_z', 'c': 'q_c', 'b': 'q_b',
            '.': 'q_dot', 
            '*': 'q0'     
        },
        'q_x': { 'y': 'q_xy', '*': 'q0' },
        'q_xy': { 'z': 'q_accept', '*': 'q0' },
        'q_t': { 'o': 'q_to', 'k': 'q_accept', '*': 'q0' }, 
        'q_to': { 'p': 'q_accept', '*': 'q0' },
        'q_z': { 'i': 'q_zi', '*': 'q0' },
        'q_zi': { 'p': 'q_accept', '*': 'q0' },
        'q_c': { 'a': 'q_ca', 'c': 'q_accept', '*': 'q0' },
        'q_ca': { 'm': 'q_accept', '*': 'q0' },
        'q_b': { 'u': 'q_bu', '*': 'q0' },
        'q_bu': { 'z': 'q_buz', '*': 'q0' },
        'q_buz': { 'z': 'q_accept', '*': 'q0' },

        'q_accept': { '*': 'q_accept' }
    },
    target: 'hostname'
}