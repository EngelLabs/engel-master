import * as core from '@engel/core';
import Bot from '../Bot';


export default class Base extends core.Base {
        core: Bot;

        public constructor(bot?: Bot) {
                super(bot);
        }

        public get bot() {
                return this.core;
        }

        public set bot(value: Bot) {
                this.core = value;
        }
}
