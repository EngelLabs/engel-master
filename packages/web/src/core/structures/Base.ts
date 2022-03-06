import * as core from '@engel/core';
import type Core from '../Core';

export default class Base extends core.Base {
        declare public core: Core;

        public get app() {
                return this.core.app;
        }
}
