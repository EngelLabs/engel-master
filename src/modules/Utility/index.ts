import Module from '../../core/structures/Module';

export default class Utility extends Module {
        constructor() {
                super();

                this.info = 'Commands to provide information about Discord objects';
                this.aliases = ['util', 'utils'];
                this.allowedByDefault = true;
        }
}
