import * as fs from 'fs';
import * as path from 'path';
import * as eris from 'eris';
import * as core from '@engel/core';
const reload = require('require-reload')(require);
import CommandCollection from './CommandCollection';
import Module from '../structures/Module';
import Core from '../Core';


const modulesPath = path.resolve('../../modules');


export default class ModuleCollection extends core.Collection<Module> {
        private _core: Core;
        private _commands: CommandCollection;

        public constructor(core: Core) {
                super();

                this._core = core;
                this._commands = core.commands;
        }

        private _log(message?: string, level?: string, prefix: string = 'Modules'): void {
                this._core.log(message, level, prefix);
        }

        public register(): Promise<void> {
                this._core.config.modules = {};

                [...this.unique()]
                        .map(m => m.globalConfig)
                        .forEach(m => {
                                if (!m) return;

                                this._core.config.modules[m.dbName] = m;
                        });

                return new Promise((resolve, reject) => {
                        this._core.models.Config.updateOne({ state: this._core.baseConfig.client.state }, { $set: { modules: this._core.config.modules } })
                                .exec()
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
                        color: this._core.config.colours.info,
                };

                if (module.info) {
                        embed.description += `**Info:** ${module.info}\n `;
                }

                if (module.commands) {
                        const commands = module.commands
                                .filter(cmd => cmd.hidden && !includeHidden ? false : true);
                        const msg = commands
                                .map(cmd => `\t**${cmd.name}**: ${cmd.info || 'No info provided'}`)
                                .join('\n');

                        if (msg?.length) {
                                embed.description += `\n**Commands [${commands.length}]:**\n${msg}`;
                        }
                }

                if (verbose) {
                        embed.footer = embed.footer || { text: '' };

                        embed.footer.text += `\nConfused? Check out "${prefix}help core"`;
                }

                return embed;
        }

        public loadSingle(moduleName: string): boolean {
                if (this.get(moduleName)) return false;

                let module: Module | undefined;

                try {
                        const Module = (reload(modulesPath + '/' + moduleName))

                        module = new (Module || Module.default);

                        if (module.disabled) {
                                this._log(`Skipping disabled module "${module.name}".`);

                                return false;
                        }

                        module.inject(this._core);

                        this.add(module);

                        this._log(`Loaded "${module.name}".`);

                        return true;

                } catch (err: any) {
                        if (module) {
                                module.eject(this._core);
                        }

                        throw err;
                }
        }

        public unloadSingle(moduleName: string): boolean {
                const module = this.get(moduleName);

                if (!module) return false;

                module.eject(this._core);

                this.remove(module);

                return true;
        }

        public reloadSingle(moduleName: string): boolean {
                const module = this.get(moduleName);

                if (!module) return false;

                this.unloadSingle(module.name);
                this.loadSingle(module.name);

                return true;
        }

        public load(moduleNames?: string[]): number {
                moduleNames = moduleNames?.length
                        ? moduleNames
                        : fs.readdirSync(modulesPath)
                                .map(m => m.endsWith('.js') ? m.slice(0, -3) : m)

                let ret = 0;
                const initial = this.size === 0;

                for (const moduleName of moduleNames) {
                        if (this.loadSingle(moduleName)) ret += 1;
                }

                if (initial) {
                        this._log(`${this.unique().size} registered.`, 'info');
                        this._log(`${this._commands.unique().size} registered.`, 'info', 'Commands');
                        this._log(`${this._commands.all().length} total registered.`, 'info', 'Commands');
                }

                return ret;
        }

        public unload(moduleNames: string[] = []): number {
                moduleNames = moduleNames?.length
                        ? moduleNames.map(m => m.endsWith('.js') ? m.slice(0, -3) : m)
                        : [...this.unique()].map(m => m.name);

                let ret = 0;

                for (const moduleName of moduleNames) {
                        if (this.unloadSingle(moduleName)) ret += 1;
                }

                return ret;
        }

        public reload(moduleNames: string[] = []): number {
                moduleNames = moduleNames?.length
                        ? moduleNames.map(m => m.endsWith('.js') ? m.slice(0, -3) : m)
                        : [...this.unique()].map(m => m.name);

                let ret = 0;

                for (const moduleName of moduleNames) {
                        if (this.reloadSingle(moduleName)) ret += 1;
                }

                return ret;
        }
}
