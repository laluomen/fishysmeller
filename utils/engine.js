class DFA {
    constructor(ruleDef) {
        this.name = ruleDef.name;
        this.startState = ruleDef.startState;
        this.weight = ruleDef.weight;
        this.acceptedStates = ruleDef.acceptedStates;
        this.transitions = ruleDef.transitions;
        this.target = ruleDef.target || 'full';
    }

    evaluate(input) {
        let currentState = this.startState;

        for (let char of input.toLowerCase()) {
            if (this.transitions[currentState] && this.transitions[currentState][char]) {
                currentState = this.transitions[currentState][char];
            } else if (this.transitions[currentState] && this.transitions[currentState]['*']) {
                currentState = this.transitions[currentState]['*'];
            } else {
                currentState = this.startState;
            }

            if (this.acceptedStates.has(currentState)) {
                return true;
            }
        }

        return this.acceptedStates.has(currentState);
    }
}

export class Detector {
    constructor(rules) {
        this.dfas = rules.map(rule => new DFA(rule));
    }

    analyze(url) {
        let score = 0;
        let triggeredRules = [];
        let hostname = url;

        try {
            const urlObject = new URL(url);
            hostname = urlObject.hostname;
            let pathname = urlObject.pathname;
            let search = urlObject.search;
            let hash = urlObject.hash;
        } catch (e) {};

        for (const dfa of this.dfas) {
            let scanUrl = (dfa.target === 'hostname') ? hostname : 
                          (dfa.target === 'pathname') ? pathname : 
                          (dfa.target === 'search') ? search :
                          (dfa.target === 'hash') ? hash : url;
            
            if (dfa.evaluate(url)) {
                score += dfa.weight;
                triggeredRules.push(dfa.name);
            }
        }

        const isRisk = score >= 30 && score < 60;
        const isDanger = score >= 60;

        return {
            isRisk: isRisk,
            isDanger: isDanger,
            riskScore: score,
            details: triggeredRules
        };
    }
}