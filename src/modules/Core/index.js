const Module = require('../../core/structures/Module');
const Context = require('../../core/structures/Context');
const baseConfig = require('../../core/utils/baseConfig');


const basePrefixes = [`<@${baseConfig.client.id}> `, `<@!${baseConfig.client.id}> `];


class Core extends Module {
        constructor() {
                super();

                this.internal = true;
                this.info = 'Core module';
        }

        injectHook() {
                this._cooldowns = new Map();
                this._globalCooldowns = new Map();
                this._permissions = this.helpers.permissions;

                this.listeners = [];

                this.listeners.push(this.messageCreate.bind(this));
                this.listeners.push(this.guildCreate.bind(this));
                this.listeners.push(this.guildDelete.bind(this));
                this.listeners.push(this.rawWS.bind(this));
        }

        async postEmbed(embed) {
                let webhook = this.config.webhooks.guildLog;

                // if (!webhook) {
                //     webhook = await this.createWebhook();
                // }

                try {
                        await superagent
                                .post(getWebhookUrl(webhook))
                                .set('Content-Type', 'application/json')
                                .send({ embeds: [embed] });
                } catch (err) {
                        // this.logger.error(err, { at: 'Core.postEmbed' });
                }
        }

        messageCreate(payload) {
                if (payload.isAdmin && !baseConfig.dev) {
                        return this.handleAdmin(payload);
                }

                return this.handleCommand(payload);
        }

        handleAdmin(p) {
                const ctx = this.resolveContext(p);

                if (!ctx) return Promise.resolve();

                return this.executeCommand(ctx);
        }

        async handleCommand(p) {
                const { isTester, isDM, message } = p;
                let { guildConfig } = p;

                if (baseConfig.dev && !isTester) return;

                if (guildConfig) {
                        if (guildConfig.isIgnored) return;
                        if (guildConfig.isPremium && !guildConfig.hasPremium) return;
                }

                const config = this.config;

                if (config.adminOnly || config.paused) return;
                if (isDM && !config.dmCommands) return;
                if (config.users.blacklisted.includes(message.author.id)) return;

                const last = this._globalCooldowns.get(message.author.id);

                if (last) {
                        if (Date.now() - last <= config.globalCooldown) return;

                        this._globalCooldowns.delete(message.author.id);
                }

                const ctx = this.resolveContext(p);

                if (!ctx) return;

                const { command, module } = ctx;

                if (!command.disableModuleCheck && module.commandCheck) {
                        if (!await module.commandCheck(ctx)) return;
                }

                if (!(
                        this._permissions.isOwner(ctx) ||
                        this._permissions.isServerAdmin(ctx) ||
                        this._permissions.canInvoke(ctx)
                )) return;

                if (command.check && !await command.check(ctx)) return;

                const key = message.author.id + command.qualName;

                const activeCooldown = this._cooldowns.get(key);
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
                this._cooldowns.set(key, {
                        time: now,
                        cooldown: cooldown
                });
                this._globalCooldowns.set(message.author.id, now);

                const moduleName = module.dbName;
                const commandName = command.dbName;

                if (!command.alwaysEnabled) {
                        if (ctx.moduleConfig && ctx.moduleConfig.disabled) {
                                if (!guildConfig.noDisableWarning) {
                                        ctx.error(`The \`${module.name}\` module is disabled in this server.`);
                                }

                                return;
                        }

                        if (guildConfig && guildConfig.commands) {
                                let isEnabled = true,
                                        disabledCmdName;

                                if (command.parent) {
                                        if (guildConfig.commands[command.rootName] && guildConfig.commands[command.rootName].disabled) {
                                                isEnabled = false;
                                                disabledCmdName = command.rootName;
                                        } else if (guildConfig.commands[commandName] === false) {
                                                isEnabled = false;
                                                disabledCmdName = command.qualName;
                                        }
                                } else {
                                        if (guildConfig.commands[commandName] && guildConfig.commands[commandName].disabled) {
                                                isEnabled = false;
                                                disabledCmdName = command.qualName;
                                        }
                                }

                                if (!isEnabled) {
                                        if (!guildConfig.noDisableWarning) {
                                                ctx.error(`The \`${disabledCmdName}\` command is disabled in this server.`);
                                        }

                                        return;
                                }
                        }
                }

                if (config.modules[moduleName] && config.modules[moduleName].disabled) {
                        return ctx.error('Sorry, this module has been disabled globally. Try again later.');
                }

                if (config.commands[commandName] && config.commands[commandName].disabled) {
                        return ctx.error('Sorry, this command has been disabled globally. Try again later.');
                }

                return this.executeCommand(ctx);
        }

        resolveContext({ guildConfig, message, isAdmin, isDM }) {
                if (isDM) guildConfig = Object.assign({}, this.config.dmConfig);

                let prefixes = basePrefixes.concat(guildConfig.prefixes);

                if (isAdmin) {
                        prefixes = prefixes.concat(this.config.prefixes.private);
                }

                prefixes.sort((a, b) => b.length - a.length);

                const prefix = prefixes.find(str => message.content.startsWith(str));

                if (typeof prefix !== 'string') return;

                const args = message.content.slice(prefix.length).replace(/ {2,}/g, ' ').split(' ');

                if (!args.length) return;

                let command = this.bot.commands.get(args.shift());

                if (!command) return;

                const module = command.module;

                while (command.commands && args.length) {
                        const subcommand = command.commands.get(args[0]);

                        if (!subcommand) break;

                        args.shift();
                        command = subcommand;
                }

                if (isDM && !command.dmEnabled) return;

                return new Context(this.bot, {
                        args,
                        prefix: prefix || '?',
                        message,
                        command,
                        module,
                        isDM,
                        guildConfig,
                });
        }

        deleteCommand(ctx) {
                const moduleName = ctx.module.dbName;
                const commandName = ctx.command.parent ? ctx.command.dbName : ctx.command.qualName;

                return this.helpers.moderation.deleteCommand(
                        ctx.guildConfig, ctx.message, moduleName, commandName,
                );
        }

        async executeCommand(ctx) {
                const { command, prefix, isAdmin, args } = ctx;

                if (command.requiredArgs && args.length < command.requiredArgs) {
                        const embed = this.bot.commands.getHelp(command, prefix, isAdmin);

                        return ctx.send({ embed });
                }

                if (command.requiredPermissions) {
                        const permissions = ctx.permissions;
                        const missingPermissions = [];

                        for (const perm of command.requiredPermissions) {
                                if (!permissions.has(perm)) {
                                        missingPermissions.push(this.permissionsMapping[perm]);
                                }
                        }

                        if (missingPermissions.length) {
                                const msg = missingPermissions.map(p => `\`${p}\``).join(', ');
                                return ctx.error(`I\'m missing the following permission(s): ${msg}`);
                        }
                }

                try {
                        let execute;

                        this.deleteCommand(ctx);

                        if (command.namespace) {
                                execute = () => {
                                        const embed = this.bot.commands.getHelp(command, prefix, isAdmin);

                                        return ctx.send({ embed });
                                }
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

        guildCreate({ guild }) {
                const eris = this.eris;

                let allMembers = 0;

                for (const guild of eris.guilds.values()) {
                        allMembers += guild.members.size;
                }

                const guildOwner = guild.members && guild.members.get(guild.ownerID);

                const msg = {
                        description: [
                                `Added to guild ${guild.name || 'UNKNOWN'} (${guild.id})`,
                                `Owner: ${guild.ownerID || 'UNKNOWN'}`,
                                `Members: ${guild.memberCount || 'UNKNOWN'}`,
                        ],
                        footer: [
                                `Total guild count: ${eris.guilds.size}`,
                                `Total member count: ${allMembers}`,
                                `Total user count: ${eris.users.size}`,
                        ]
                };

                const embed = {
                        description: msg.description.join('\n'),
                        timestamp: new Date().toISOString(),
                        color: this.config.colours.success,
                        footer: { text: msg.footer.join('\n') },
                };

                if (guildOwner) {
                        embed.author = {
                                name: guildOwner.username + '#' + guildOwner.discriminator,
                                url: guildOwner.avatarURL,
                                icon_url: guildOwner.avatarURL,
                        };

                        embed.thumbnail = { url: guildOwner.avatarURL };
                }

                this.postEmbed(embed);
        }

        guildDelete({ guild }) {
                const eris = this.eris;

                let allMembers = 0;

                for (const guild of eris.guilds.values()) {
                        allMembers += guild.members.size;
                }

                const guildOwner = guild.members && guild.members.get(guild.ownerID);

                const msgs = {
                        description: [
                                `Removed from guild ${guild.name || 'UNKNOWN'} (${guild.id})`,
                                `Owner: ${guild.ownerID || 'UNKNOWN'}`,
                                `Members: ${guild.memberCount || 'UNKNOWN'}`,
                        ],
                        footer: [
                                `Total guild count: ${eris.guilds.size}`,
                                `Total member count: ${allMembers}`,
                                `Total user count: ${eris.users.size}`,
                        ]
                };

                const embed = {
                        description: msgs.description.join('\n'),
                        timestamp: new Date().toISOString(),
                        color: this.config.colours.error,
                        footer: { text: msgs.footer.join('\n') },
                };

                if (guildOwner) {
                        embed.author = {
                                name: guildOwner.username + '#' + guildOwner.discriminator,
                                url: guildOwner.avatarURL,
                                icon_url: guildOwner.avatarURL,
                        };

                        embed.thumbnail = { url: guildOwner.avatarURL };
                }

                this.postEmbed(embed);
        }

        rawWS() {
                if (!this.events) this.events = 0;
                this.events++;
        }

        commandSuccess({ isAdmin, command, author, message, guild }) {
                let text = `Command "${command.qualName}" U${author.id}`;

                if (guild) {
                        text += `G${guild.id}`;
                }

                this.log(text);

                if (!isAdmin && !this.baseConfig.dev) {
                        const doc = {
                                name: command.dbName,
                                message: {
                                        id: message.id,
                                        content: message.content,
                                        author: author.id,
                                        guild: guild.id,
                                },
                        };

                        this.models.CommandLog.create(doc)
                                .catch(err => this.log(err, 'error'));
                }
        }

        commandError({ isAdmin, command, author, guild, message, err }) {
                let text = `Command "${command.qualName}" U${author.id}`;

                if (guild) {
                        text += `G${guild.id}`;
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
                                        guild: guild.id,
                                },
                                failed: true,
                        };

                        this.models.CommandLog.create(doc)
                                .catch(err => this.log(err, 'error'));
                }
        }
}


module.exports = Core;