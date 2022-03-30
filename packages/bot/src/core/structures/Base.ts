import * as core from '@engel/core';
import type App from '../structures/App';

export default class Base extends core.Base {
        declare public app: App;

        public get baseConfig() {
                return this.app.baseConfig;
        }
}
