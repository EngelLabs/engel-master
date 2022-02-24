import * as core from '@engel/core';
import Command from '../structures/Command';
import Core from '../Core';


export default class CommandCollection extends core.Collection<Command> {
        private _core?: Core;

        public constructor(core?: Core) {
                super();

                if (core) {
                        this._core = core;
                }
        }

        public register(): Promise<void> {
                this._core.config.commands = {};

                this.all()
                        .map(command => command.globalConfig)
                        .forEach(c => {
                                if (!c) return;

                                this._core.config.commands[c.name] = c;
                        });

                return new Promise((resolve, reject) => {
                        this._core.models.Config.updateOne({ state: this._core.baseConfig.client.state }, { $set: { commands: this._core.config.commands } })
                                .exec()
                                .then(() => resolve())
                                .catch(reject);
                });
        }

        public all(): Command[] {
                const ret = [...this.unique()];

                for (const command of this.unique()) {
                        if (command.commands) {
                                ret.push(...command.commands.all());
                        }
                }

                return ret.flat();
        }
}
