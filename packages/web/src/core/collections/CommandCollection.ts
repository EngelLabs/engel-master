import * as core from '@engel/core';
import type * as types from '@engel/types';
import type App from '../structures/App';

interface Command extends types.GlobalCommandConfig {
        rootName: string;
        isSubcommand: boolean;

}

export default class CommandCollection extends core.Collection<Command> {
        private _app: App;
        private _logger: core.Logger;

        public constructor(app: App) {
                super();

                this._app = app;
                this._logger = app.logger.get('Commands');

                this.load();
        }

        public load() {
                const commands = this._app.config.commands;

                for (const key in commands) {
                        const command: any = Object.assign({}, commands[key]);

                        command.rootName = command.name.split('_')[0];
                        command.isSubcommand = command.name.includes('_');

                        this.set(command.name, command);

                        this._logger.debug(`Loaded "${command.name}"`);
                }

                this._logger.debug(`${this.size} registered.`);
        }
}
