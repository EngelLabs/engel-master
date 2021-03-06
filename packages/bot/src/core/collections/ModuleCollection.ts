import * as path from 'path';
import * as core from '@engel/core';
import type * as eris from 'eris';
import type CommandCollection from './CommandCollection';
import type Module from '../structures/Module';
import type App from '../structures/App';
const reload = require('require-reload')(require);

const modulesPath = path.join(__dirname, '../../modules');

export default class ModuleCollection extends core.Collection<Module> {
        private _app: App;
        private _commands: CommandCollection;
        private _logger: core.Logger;

        public constructor(app: App) {
                super();

                this._app = app;
                this._commands = app.commands;
                this._logger = app.logger.get('Modules');

                const redisEvents = ['modules:load', 'modules:unload', 'modules:reload'];

                app.ipc.subscribe(...redisEvents);

                redisEvents.forEach(ev => {
                        const methodName = <'load' | 'unload' | 'reload'>ev.slice(ev.indexOf(':') + 1);
                        app.ipc.on(ev, async (moduleNames: string[]) => {
                                try {
                                        const p = this[methodName](moduleNames);
                                        if (p instanceof Promise) {
                                                await p;
                                        }
                                } catch (err) {
                                        this._logger.error(err);
                                }
                        });
                });
        }

        public register(): Promise<void> {
                const update: any = {};

                this.unique()
                        .map(m => m.globalConfig)
                        .forEach(m => {
                                if (!m) return;

                                update[`module.${m.dbName}`] = m;
                        });

                return new Promise((resolve, reject) => {
                        this._app.mongo.configurations.updateOne({ state: this._app.staticConfig.client.state }, { $set: update })
                                .then(() => resolve())
                                .catch(reject);
                });
        }

        /**
         * Get help for a module in the form of an embed object.
         * @param module Module object
         * @param includeHidden Whether to include hidden values
         * @param verbose Whether to add verbose footer
         */
        public help(moduleName: string, prefix: string = '?', includeHidden: boolean = false, verbose: boolean = true): eris.EmbedOptions {
                const module = this.get(moduleName);

                if (!module || ((module.private || module.internal || module.disabled) && !includeHidden)) return;

                const embed: eris.EmbedOptions = {
                        title: `Module "${module.name}" info`,
                        description: '',
                        color: this._app.config.colours.info
                };

                if (module.info) {
                        embed.description += `**Info:** ${module.info}\n `;
                }

                if (module.commands) {
                        const commands = module.commands
                                .filter(cmd => !(cmd.hidden && !includeHidden));
                        const msg = commands
                                .map(cmd => `\t**${cmd.name}**: ${cmd.info || 'No info provided'}`)
                                .join('\n');

                        if (msg?.length) {
                                embed.description += `\n**Commands [${commands.length}]:**\n${msg}`;
                        }
                }

                if (verbose) {
                        embed.footer = embed.footer || { text: '' };

                        embed.footer.text += `\nConfused? Check out "${prefix}help bot"`;
                }

                return embed;
        }

        public async loadSingle(moduleName: string): Promise<boolean> {
                if (this.get(moduleName)) return false;

                let module: Module | undefined;

                try {
                        const ModuleConstructor: typeof Module = (reload(modulesPath + '/' + moduleName)).default;

                        module = new ModuleConstructor(this._app);

                        return this._loadModule(module);
                } catch (err: any) {
                        if (module) {
                                module.eject(this._app);
                        }

                        throw err;
                }
        }

        public unloadSingle(moduleName: string): boolean {
                const module = this.get(moduleName);

                if (!module) return false;

                module.eject(this._app);

                this.remove(module);

                return true;
        }

        public async reloadSingle(moduleName: string): Promise<boolean> {
                const module = this.get(moduleName);

                if (!module) return false;

                this.unloadSingle(module.name);

                try {
                        await this.loadSingle(module.name);
                } catch (err) {
                        // Loading the new version of the module failed,
                        // fall back to previous working version.
                        // reconstructing to clear any bad state that
                        // the inject/eject hooks can cause
                        const ModuleConstructor: typeof Module = (<any>module).constructor;

                        await this._loadModule(new ModuleConstructor(this._app));

                        throw err;
                }

                return true;
        }

        private async _loadModule(module: Module): Promise<boolean> {
                if (module.disabled) {
                        this._logger.debug(`Skipping disabled module "${module.name}".`);

                        return false;
                }

                await module.inject(this._app);

                this.add(module);

                this._logger.debug(`Loaded "${module.name}".`);

                return true;
        }

        public async load(moduleNames?: string[]): Promise<number> {
                moduleNames = moduleNames?.length
                        ? moduleNames
                        : (await this._app.utils.readdir(modulesPath))
                                .map(m => m.endsWith('.js') ? m.slice(0, -3) : m);

                let ret = 0;
                const initial = this.size === 0;

                for (const moduleName of moduleNames) {
                        if (await this.loadSingle(moduleName)) ret += 1;
                }

                if (initial) {
                        this._logger.debug(`${this.unique().length} registered.`);
                        const logger = this._app.logger.get('Commands');
                        logger.debug(`${this._commands.unique().length} registered.`);
                        logger.debug(`${this._commands.all().length} total registered.`);
                }

                return ret;
        }

        public unload(moduleNames: string[] = []): number {
                moduleNames = moduleNames?.length
                        ? moduleNames.map(m => m.endsWith('.js') ? m.slice(0, -3) : m)
                        : this.unique().map(m => m.name);

                let ret = 0;

                for (const moduleName of moduleNames) {
                        if (this.unloadSingle(moduleName)) ret += 1;
                }

                return ret;
        }

        public async reload(moduleNames: string[] = []): Promise<number> {
                moduleNames = moduleNames?.length
                        ? moduleNames.map(m => m.endsWith('.js') ? m.slice(0, -3) : m)
                        : this.unique().map(m => m.name);

                let ret = 0;

                for (const moduleName of moduleNames) {
                        if (await this.reloadSingle(moduleName)) ret += 1;
                }

                return ret;
        }
}
