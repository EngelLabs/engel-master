import Module from '../../core/structures/Module';

export default class Info extends Module {
        constructor() {
                super();

                this.aliases = ['information'];
                this.info = 'Commands to provide information about the core';
                this.allowedByDefault = true;
        }
}
