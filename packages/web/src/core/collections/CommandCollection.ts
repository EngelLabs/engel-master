import * as core from '@engel/core';
import * as types from '@engel/types';
import Core from '../Core';


export default class CommandCollection extends core.Collection {
        private _core: Core;

        public constructor(core: Core) {
                super();

                this._core = core;

                this.load();
        }

        private _log(message: any, level?: types.LogLevels) {
                this._core.log(message, level, 'Commands');
        }

        public load() {
                const commands = this._core.config.commands;

                for (const key in commands) {
                        const command = Object.assign({}, commands[key]);
                        command.rootName = command.name.split('_')[0];
                        command.isSubcommand = command.name.includes('_');

                        this.set(command.name, command);

                        this._log(`Loaded "${command.name}"`);
                }

                this._log(`${this.size} registered.`, 'info');
        }
}
