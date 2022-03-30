import * as core from '@engel/core';
import type * as types from '@engel/types';
import type App from '../structures/App';

interface Command extends types.GlobalCommandConfig {
        rootName: string;
        isSubcommand: boolean;

}

export default class CommandCollection extends core.Collection<Command> {
        private _app: App;

        public constructor(app: App) {
                super();

                this._app = app;

                this.load();
        }

        private _log(message: any, level?: types.LogLevels) {
                this._app.log(message, level, 'Commands');
        }

        public load() {
                const commands = this._app.config.commands;

                for (const key in commands) {
                        const command: any = Object.assign({}, commands[key]);

                        command.rootName = command.name.split('_')[0];
                        command.isSubcommand = command.name.includes('_');

                        this.set(command.name, command);

                        this._log(`Loaded "${command.name}"`);
                }

                this._log(`${this.size} registered.`);
        }
}
