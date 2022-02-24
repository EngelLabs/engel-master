import * as core from '@engel/core';
import Core from '../Core';


export default class Base extends core.Base {
        core: Core;

        public constructor(core?: Core) {
                super(core);
        }
}
