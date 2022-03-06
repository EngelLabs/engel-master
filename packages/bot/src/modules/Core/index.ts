import type * as eris from 'eris';
import type * as types from '@engel/types';
import Module from '../../core/structures/Module';
import Command from '../../core/structures/Command';
import Context from '../../core/structures/Context';
import Permission from '../../core/helpers/Permission';
import baseConfig from '../../core/utils/baseConfig';

const basePrefixes = [`<@${baseConfig.client.id}> `, `<@!${baseConfig.client.id}> `];

interface Payload {
        isDM: boolean;
        isAdmin: boolean;
        isTester: boolean;
        isTesting: boolean;
        message: eris.Message;
        guildConfig: types.GuildConfig;
}

interface Cooldown {
        time: number;
        cooldown: number;
        warned?: boolean;
}

export default class Core extends Module {
        private cooldowns: Map<string, Cooldown>;
        private globalCooldowns: Map<string, number>;
        private permissions: Permission;
        private events?: number;

        public constructor() {
                super();

                this.private = true;
                this.internal = true;
                this.info = 'Core module';
        }

        public injectHook(): void {
                this.cooldowns = new Map();
                this.globalCooldowns = new Map();
                this.permissions = new Permission(this.core);

                this.tasks = [];
                this.listeners = [];

                this.tasks.push([this.clearCooldowns.bind(this), 5000]);
                this.listeners.push(this.messageCreate.bind(this));
                // this.listeners.push(this.guildCreate.bind(this));
                // this.listeners.push(this.guildDelete.bind(this));
                this.listeners.push(this.rawWS.bind(this));

                const admin = new Command<Core>({
                        name: 'admin',
                        aliases: ['a'],
                        namespace: true,
                        hidden: true,
                        info: 'Namespace for admin commands'
                });

                for (const command of this.commands) {
                        command.parent = admin;
                }

                this.commands = [admin];
        }

        public commandCheck(ctx: Context): boolean {
                return ctx.author.id === ctx.config.author.id;
        }

        public clearCooldowns(): void {
                if (this.cooldowns.size) {
                        for (const [key, cooldown] of this.cooldowns.entries()) {
                                if ((Date.now() - cooldown.time) >= cooldown.cooldown) {
                                        this.cooldowns.delete(key);
                                }
                        }
                }

                if (this.globalCooldowns.size) {
                        const config = this.config;

                        for (const [key, time] of this.globalCooldowns.entries()) {
                                if ((Date.now() - time) >= config.globalCooldown) {
                                        this.globalCooldowns.delete(key);
                                }
                        }
                }
        }

        private async postEmbed(embed: eris.EmbedOptions): Promise<void> {
                // TODO
        }

        private messageCreate(payload: Payload): Promise<void> {
                if (payload.isAdmin) {
                        return this.handleAdmin(payload);
                }

                return this.handleCommand(payload);
        }

        private handleAdmin(p: Payload): Promise<void> {
                const ctx = this.resolveContext(p);

                if (!ctx) {
                        return Promise.resolve();
                }

                return this.executeCommand(ctx);
        }

        private async handleCommand(p: Payload): Promise<void> {
                const { isTester, isTesting, isDM, message, guildConfig } = p;

                if (baseConfig.dev && (!isTester || (!isDM && !isTesting))) return;

                if (guildConfig) {
                        if (guildConfig.isIgnored) return;
                        if (guildConfig.isPremium && (!baseConfig.client.premium || guildConfig.hasPremium)) return;
                }

                const config = this.config;

                if (config.adminOnly || config.paused) return;
                if (isDM && !config.dmCommands) return;
                if (config.users.blacklisted.includes(message.author.id)) return;

                const last = this.globalCooldowns.get(message.author.id);

                if (last) {
                        if (Date.now() - last <= config.globalCooldown) return;

                        this.globalCooldowns.delete(message.author.id);
                }

                const ctx = this.resolveContext(p);

                if (!ctx) return;

                const { command, module } = ctx;

                if (!command.disableModuleCheck && module.commandCheck) {
                        if (!await module.commandCheck(ctx)) return;
                }

                if (!isDM && !(
                        this.permissions.isOwner(ctx) ||
                        this.permissions.isServerAdmin(ctx) ||
                        this.permissions.canInvoke(ctx)
                )) return;

                if (command.check && !await command.check(ctx)) return;

                const key = message.author.id + command.qualName;

                const activeCooldown = this.cooldowns.get(key);
                if (activeCooldown && (Date.now() - activeCooldown.time) <= activeCooldown.cooldown) {
                        if (!activeCooldown.warned && config.cooldownWarn) {
                                activeCooldown.warned = true;

                                ctx.send(`${message.author.mention}, Not so fast!`)
                                        .then(msg => {
                                                if (!msg || !config.cooldownWarnDelete) return;

                                                setTimeout(() => msg.delete().catch(() => false), config.cooldownWarnDeleteAfter);
                                        })
                                        .catch(() => false);
                        }

                        return;
                }

                const cooldown = typeof command.cooldown !== 'undefined' ? command.cooldown : config.commandCooldown;
                const now = Date.now();
                this.cooldowns.set(key, {
                        time: now,
                        cooldown: cooldown
                });
                this.globalCooldowns.set(message.author.id, now);

                const moduleName = module.dbName;
                const commandName = command.dbName;

                if (!isDM && !command.alwaysEnabled) {
                        if (!module.isEnabled(guildConfig)) {
                                if (!guildConfig.noDisableWarning) {
                                        ctx.error(`The \`${module.name}\` module is disabled in this server.`);
                                }

                                return;
                        }

                        const [enabled, cmdName] = command.isEnabled(guildConfig, true);

                        if (!enabled) {
                                if (!guildConfig.noDisableWarning) {
                                        ctx.error(`The \`${cmdName}\` command is disabled in this server.`);
                                }

                                return;
                        }
                }

                if (config.modules?.[moduleName]?.disabled) {
                        ctx.error('Sorry, this module has been disabled globally. Try again later.');

                        return;
                }

                if (config.commands?.[commandName]?.disabled) {
                        ctx.error('Sorry, this command has been disabled globally. Try again later.');

                        return;
                }

                return this.executeCommand(ctx);
        }

        private resolveContext({ guildConfig, message, isAdmin, isTesting, isDM }: Payload): Context {
                let prefixes: string[];

                if (isDM) {
                        prefixes = this.config.prefixes.dm;
                } else {
                        prefixes = guildConfig.prefixes;
                }

                prefixes = basePrefixes.concat(prefixes);

                const adminPrefix = baseConfig.client.name + '?';

                if (isAdmin) {
                        prefixes = prefixes.concat(this.config.prefixes.private);
                        prefixes.push(adminPrefix);
                }

                prefixes.sort((a, b) => b.length - a.length);

                const prefix = prefixes.find(str => message.content.startsWith(str));

                if (typeof prefix !== 'string') return;

                if (!isDM && guildConfig.client !== baseConfig.client.name && prefix !== adminPrefix) {
                        if (!isTesting && (<eris.TextChannel>message.channel).guild.ownerID !== this.eris.user.id) {
                                this.eris.leaveGuild(guildConfig.id).catch(() => false);
                        }

                        return;
                }

                const args = message.content.slice(prefix.length).replace(/ {2,}/g, ' ').split(' ');

                if (!args.length) return;

                let command = this.core.commands.get(args.shift());

                if (!command) return;

                const module = command.module;

                while (command.commands && args.length) {
                        const subcommand = command.commands.get(args[0]);

                        if (!subcommand) break;

                        args.shift();
                        command = subcommand;
                }

                if (isDM && !command.dmEnabled) return;

                // const parseArg = name => {
                //         const str = args.find(str => str.startsWith(name));

                //         if (!str) return false;

                //         if (str.indexOf('=') !== -1) {
                //                 const idx = str.indexOf('=');

                //                 args.shift();

                //                 return [str.slice(0, idx), str.slice(idx + 1)];
                //         }

                //         return [args.shift(), args.shift()];
                // }

                const ctx = new Context(this.core, {
                        args,
                        prefix: prefix || '?',
                        message,
                        command,
                        module,
                        isDM,
                        isAdmin,
                        guildConfig
                });

                // if (command.options) {
                //         const parsedArgs = {};

                //         for (const opt of command.options) {
                //                 const names = [opt.name];
                //                 if (opt.alias) {
                //                         if (opt.alias instanceof Array) {
                //                                 names.push(...opt.alias);
                //                         } else {
                //                                 names.push(opt.alias);
                //                         }
                //                 }

                //                 let key;
                //                 let value = false;

                //                 while (value === false && names.length) {
                //                         const ret = parseArg(names.shift());

                //                         if (ret === false) {
                //                                 continue;
                //                         }

                //                         [key, value] = ret;
                //                 }

                //                 if (value === false && opt.default) {
                //                         if (typeof opt.default === 'function') {
                //                                 value = opt.default(ctx);
                //                         } else {
                //                                 value = opt.default;
                //                         }
                //                 }

                //                 if (value === false && opt.required) {
                //                         ctx.error(`Missing required argument \`${opt.name}\``);

                //                         return;
                //                 }

                //                 if (opt.type) {
                //                         value = opt.type(value);

                //                         if (value?.constructor !== opt.type) {
                //                                 ctx.error(`Type for \`${key}\`is invalid, a \`${opt.type.constructor.name.toLowerCase()}\` is expected.`);

                //                                 return;
                //                         }
                //                 }

                //                 parsedArgs[opt.name.replace('--', '')] = value;
                //         }

                //         ctx.args = parsedArgs;
                // }

                return ctx;
        }

        private deleteCommand(ctx: Context): Promise<void> {
                return new Promise(resolve => {
                        const del = () => {
                                ctx.message
                                        .delete()
                                        .then(resolve)
                                        .catch(resolve);
                        };

                        const commandConfig = ctx.guildConfig.commands?.[ctx.command.rootName];
                        const moduleConfig = ctx.moduleConfig;

                        if (typeof commandConfig !== 'boolean' && commandConfig?.del !== undefined) {
                                return commandConfig.del ? del() : resolve();
                        } else if (moduleConfig?.delCommands !== undefined) {
                                return moduleConfig.delCommands ? del() : resolve();
                        } else if (ctx.guildConfig.delCommands) {
                                return del();
                        }

                        resolve();
                });
        }

        private async executeCommand(ctx: Context): Promise<any> {
                const { command, prefix, isDM, isAdmin, args } = ctx;

                if (args.length < command?.requiredArgs) {
                        const embed = this.core.commands.help(command.qualName, prefix, isAdmin);

                        if (!embed) {
                                this.log(new Error('Unreachable code'), 'error');
                        }

                        ctx.send({ embed });

                        return;
                }

                if (!isDM && command.requiredPermissions) {
                        const permissions = ctx.permissions;
                        const missingPermissions = [];

                        for (const perm of command.requiredPermissions) {
                                if (!permissions.has(perm)) {
                                        missingPermissions.push(this.permissionsMapping[perm]);
                                }
                        }

                        if (missingPermissions.length) {
                                const msg = missingPermissions.map(p => `\`${p}\``).join(', ');
                                ctx.error(`I'm missing the following permission(s): ${msg}`);
                        }
                }

                try {
                        let execute: () => Promise<any>;

                        if (!isDM) this.deleteCommand(ctx);

                        if (command.namespace) {
                                execute = () => {
                                        const embed = this.core.commands.help(command.qualName, prefix, isAdmin);

                                        return ctx.send({ embed });
                                };
                        } else {
                                execute = () => command.execute(ctx);
                        }

                        if (command.before) {
                                await command.before(ctx);
                        }

                        if (!ctx.done) {
                                await execute();

                                if (!ctx.done && command.after) {
                                        await command.after(ctx);
                                }
                        }
                } catch (err) {
                        ctx.err = err;
                        this.commandError(ctx);

                        return ctx.error('Sorry, something went wrong.');
                }

                this.commandSuccess(ctx);
        }

        private guildCreate({ guild }: { guild: eris.Guild }): void {
                const eris = this.eris;

                let allMembers = 0;

                for (const guild of eris.guilds.values()) {
                        allMembers += guild.members.size || 0;
                }

                const guildOwner = guild.members?.get?.(guild.ownerID);

                const msg = {
                        description: [
                                `Added to guild ${guild.name || 'UNKNOWN'} (${guild.id})`,
                                `Owner: ${guild.ownerID || 'UNKNOWN'}`,
                                `Members: ${guild.memberCount || 'UNKNOWN'}`
                        ],
                        footer: [
                                `Total guild count: ${eris.guilds.size}`,
                                `Total member count: ${allMembers}`,
                                `Total user count: ${eris.users.size}`
                        ]
                };

                const embed: eris.EmbedOptions = {
                        description: msg.description.join('\n'),
                        timestamp: new Date().toISOString(),
                        color: this.config.colours.success,
                        footer: { text: msg.footer.join('\n') }
                };

                if (guildOwner) {
                        embed.author = {
                                name: guildOwner.username + '#' + guildOwner.discriminator,
                                url: guildOwner.avatarURL,
                                icon_url: guildOwner.avatarURL
                        };

                        embed.thumbnail = { url: guildOwner.avatarURL };
                }

                this.postEmbed(embed);
        }

        private guildDelete({ guild }: { guild: eris.Guild }): void {
                const eris = this.eris;

                let allMembers = 0;

                for (const guild of eris.guilds.values()) {
                        allMembers += guild.members.size || 0;
                }

                const guildOwner = guild.members?.get?.(guild.ownerID);

                const msgs = {
                        description: [
                                `Removed from guild ${guild.name || 'UNKNOWN'} (${guild.id})`,
                                `Owner: ${guild.ownerID || 'UNKNOWN'}`,
                                `Members: ${guild.memberCount || 'UNKNOWN'}`
                        ],
                        footer: [
                                `Total guild count: ${eris.guilds.size}`,
                                `Total member count: ${allMembers}`,
                                `Total user count: ${eris.users.size}`
                        ]
                };

                const embed: eris.EmbedOptions = {
                        description: msgs.description.join('\n'),
                        timestamp: new Date().toISOString(),
                        color: this.config.colours.error,
                        footer: { text: msgs.footer.join('\n') }
                };

                if (guildOwner) {
                        embed.author = {
                                name: guildOwner.username + '#' + guildOwner.discriminator,
                                url: guildOwner.avatarURL,
                                icon_url: guildOwner.avatarURL
                        };

                        embed.thumbnail = { url: guildOwner.avatarURL };
                }

                this.postEmbed(embed);
        }

        private rawWS(): void {
                if (!this.events) {
                        this.events = 0;
                }

                this.events++;
        }

        private commandSuccess({ isAdmin, command, author, message, guild }: Context): void {
                let text = `Command "${command.qualName}" U${author.id}`;

                if (guild) {
                        text += ` G${guild.id}`;
                }

                this.log(text);

                if (!isAdmin && !this.baseConfig.dev) {
                        const doc = {
                                name: command.dbName,
                                message: {
                                        id: message.id,
                                        content: message.content,
                                        author: author.id,
                                        guild: guild.id
                                }
                        };

                        this.models.CommandLog.create(doc)
                                .catch(err => this.log(err, 'error'));
                }
        }

        private commandError({ isAdmin, command, author, guild, message, err }: Context): void {
                let text = `Command "${command.qualName}" U${author.id}`;

                if (guild) {
                        text += ` G${guild.id}`;
                }

                this.logger.error(text);
                console.error(err);

                if (!isAdmin && !this.baseConfig.dev) {
                        const doc = {
                                name: command.dbName,
                                message: {
                                        id: message.id,
                                        content: message.content,
                                        author: author.id,
                                        guild: guild.id
                                },
                                failed: true
                        };

                        this.models.CommandLog.create(doc)
                                .catch(err => this.log(err, 'error'));
                }
        }
}
