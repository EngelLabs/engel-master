const Module = require('../../structures/Module');

const penisExchangeBuddies = [
    '310232682636509184', // A1pha
    '366789046669934593', // Lysankya
    '338082875394097153', // sempai
    '329768023869358081', // timtoy
    // '756389805071269908', // Mr.GodAtEverything
    '769350257430626325', // aerro
    '555081433153011727', // choppedliver
    '485963117369491466', // Equinox.
    '451546885271060481', // Rav3n
    '530853147242004501', // RiceCooker9000
];

class Penis extends Module {
    constructor() {
        super();

        this.info = 'The most important module.';
        this.private = true;
    }

    commandCheck({ author }) {
        return penisExchangeBuddies.includes(author.id);
    }
}


module.exports = Penis;