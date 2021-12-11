const Module = require('../../structures/Module');
const Context = require('../../structures/Context');
const baseConfig = require('../../core/baseConfig');
const reload = require('require-reload')(require);
const Checks = reload('./Checks');
const Converter = reload('./Converter');
const Helper = reload('./Helper');


const basePrefixes = [`<@${baseConfig.clientId}> `, `<@!${baseConfig.clientId}> `];
const permissionsMapping = {
    createInstantInvite: 'Create Instant Invite',
    kickMembers: 'Kick Members',
    banMembers: 'Ban Members',
    administrator: 'Administrator',
    manageChannels: 'Manage Channels',
    manageGuild: 'Manage Server',
    addReactions: 'Add Reactions',
    viewAuditLog: 'View Audit Logs',
    voicePrioritySpeaker: 'Voice Priority Speaker',
    voiceStream: 'Voice Stream',
    viewChannel: 'View Channel',
    sendMessages: 'Send Messages',
    sendTTSMessages: 'Send TTS Messages',
    manageMessages: 'Manage Messages',
    embedLinks: 'Embed Links',
    attachFiles: 'Attach Files',
    readMessageHistory: 'Read Message History',
    mentionEveryone: 'Mention Everyone',
    useExternalEmojis: 'Use External Emojis',
    viewGuildInsights: 'View Server Insights',
    voiceConnect: 'Voice Connect',
    voiceSpeak: 'Voice Speak',
    voiceMuteMembers: 'Voice Mute Members',
    voiceDeafenMembers: 'Voice Deafen Members',
    voiceMoveMembers: 'Voice Move Members',
    voiceUseVAD: 'Voice Use Activity',
    changeNickname: 'Change Nickname',
    manageNicknames: 'Manage Nicknames',
    manageRoles: 'Manage Roles',
    manageWebhooks: 'Manage Webhooks',
    manageEmojis: 'Manage Emojis',
    useSlashCommands: 'Use Slash Commands',
    voiceRequestToSpeak: 'Voice Request To Speak',
};


class Core extends Module {
    constructor() {
        super();

        this.internal = true;
        this.info = 'Core module';
    }

    injectHook() {
        this.cooldowns = new Map();
        this.globalCooldowns = new Map();

        this.checks = this.bot.checks = new Checks(this);
        this.converter = this.bot.converter = new Converter(this);
        this.helper = this.bot.helper = new Helper(this);

        this.listeners = [];
        this.botListeners = [];
        this.listeners.push(this.messageCreate.bind(this));
        this.listeners.push(this.guildCreate.bind(this));
        this.listeners.push(this.guildDelete.bind(this));
        this.listeners.push(this.rawWS.bind(this));
        this.botListeners.push(this.commandSuccess.bind(this));
        this.botListeners.push(this.commandError.bind(this));
    }

    ejectHook() {
        delete this.bot.checks;
        delete this.bot.converter;
        delete this.bot.helper;
    }

    async postEmbed(embed) {
        let webhook = this.bot.config.webhooks.guildLog;

        // if (!webhook) {
        //     webhook = await this.createWebhook();
        // }

        try {
            await superagent
                .post(getWebhookUrl(webhook))
                .set('Content-Type', 'application/json')
                .send({ embeds: [embed] });
        } catch (err) {
            this.logger.error(err, { at: 'Core.postEmbed' });
        }
    }

    log(msg, level = 'debug') {
        return this.logger[level](`[Modules.Core] ${msg}`);
    }

    async messageCreate(message) {
        if (message.author.bot || !this.bot.ready || !this.bot.config) return;

        const isAdmin = this.checks.isAdmin(message);
        const config = this.bot.config;

        if ((config.dev || config.adminOnly || config.shutup) && !isAdmin) return;
        if (config.users.blacklisted.includes(message.author.id)) return;

        if (!isAdmin) {
            const last = this.globalCooldowns.get(message.author.id);

            if (last) {
                if (Date.now() - last <= config.globalCooldown) return;

                this.globalCooldowns.delete(message.author.id);
            }
        }

        const isDM = !message.channel.guild;
        let guildConfig;

        if (!isDM) {
            try {
                guildConfig = await this.bot.guilds.getOrFetch(message.channel.guild.id);
            } catch (err) {
                return this.logger.error(err);
            }

            if (!guildConfig) {
                try {
                    guildConfig = await this.bot.guilds.create(message.channel.guild.id);
                } catch (err) {
                    return this.logger.error(err);
                }
            }

        } else {
            guildConfig = Object.assign({}, config.dmConfig);
        }

        if (guildConfig.blacklisted && !isAdmin) return;

        let prefixes = basePrefixes.concat(guildConfig.prefixes);

        if (isAdmin) {
            prefixes = prefixes.concat(config.prefixes.private);
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

        const ctx = new Context({
            bot: this.bot,
            eris: this.eris,
            args,
            prefix,
            message,
            command,
            module,
            isDM,
            isAdmin,
            guildConfig,
        });

        if (!isAdmin && !config.dev) {
            if (module.commandCheck && !command.disableModuleCheck) {
                if (!await Promise.resolve(module.commandCheck(ctx))) return;
            }

            if (command.check) {
                if (!await Promise.resolve(command.check(ctx))) return;
            }

            const key = message.author.id + command.qualName;

            const activeCooldown = this.cooldowns.get(key);
            if (activeCooldown && (Date.now() - activeCooldown.time) <= activeCooldown.cooldown) {
                if (!activeCooldown.warned && config.cooldownWarn) {
                    activeCooldown.warned = true;

                    ctx.send(`${message.author.mention}, Not so fast!`)
                        .then(msg => {
                            if (!msg) return;

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

            if (!command.alwaysEnabled) {
                if (ctx.moduleConfig && ctx.moduleConfig.enabled === false) {
                    return ctx.error(`The \`${module.name}\` module is disabled in this server.`);
                }

                if (guildConfig.commands) {
                    let isEnabled = true,
                        disabledCmdName;

                    if (command.parent) {
                        if (guildConfig.commands[command.rootName] && guildConfig.commands[command.rootName].enabled === false) {
                            isEnabled = false;
                            disabledCmdName = command.rootName;
                        } else if (guildConfig.commands[commandName] === false) {
                            isEnabled = false;
                            disabledCmdName = command.qualName;
                        }
                    } else {
                        if (guildConfig.commands[commandName] && guildConfig.commands[commandName].enabled === false) {
                            isEnabled = false;
                            disabledCmdName = command.qualName;
                        }
                    }

                    if (!isEnabled) {
                        return ctx.error(`The \`${disabledCmdName}\` command is disabled in this server.`);
                    }
                }
            }

            if (config.modules[moduleName] && !config.modules[moduleName].enabled) {
                return ctx.error('Sorry, this module has been disabled globally. Try again later.');
            }

            if (config.commands[commandName] && !config.commands[commandName].enabled) {
                return ctx.error('Sorry, this command has been disabled globally. Try again later.');
            }
        }

        if (command.requiredArgs && args.length < command.requiredArgs) {
            const embed = this.bot.commands.getHelp(command, prefix, isAdmin);

            return ctx.send({
                embed
            });
        }

        if (command.requiredPermissions) {
            const permissions = ctx.permissions;
            const missingPermissions = [];

            for (const perm of command.requiredPermissions) {
                if (!permissions.has(perm)) {
                    missingPermissions.push(permissionsMapping[perm]);
                }
            }

            if (missingPermissions.length) {
                const msg = missingPermissions.map(p => `\`${p}\``).join(', ');
                return ctx.error(`I\'m missing the following permission(s): ${msg}`);
            }
        }

        try {
            if (command.before) {
                await command.before(ctx);
            }

            if (!ctx.done) {
                await command.execute(ctx);

                if (command.after) {
                    await command.after(ctx);
                }
            }
        } catch (err) {
            this.logger.error(err);
            ctx.err = err;
            this.bot.emit('commandError', ctx);
            return ctx.error('Sorry, something went wrong.');
        }

        this.bot.emit('commandSuccess', ctx);
    }

    guildCreate(guild) {
        if (!this.bot.ready || guild.unavailable) return;

        const eris = this.eris;

        let allMembers = 0;

        for (const guild of eris.guilds.values()) {
            allMembers += guild.members.size;
        }

        const guildOwner = guild.members.get(guild.ownerID);

        const msgs = {
            description: [
                `Added to guild ${guild.name} (${guild.id})`,
                `Owner: ${guildOwner.username}#${guildOwner.discriminator} (${guild.ownerID})`,
                `Members: ${guild.memberCount}`,
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
            color: this.bot.config.colours.success,
            footer: { text: msgs.footer.join('\n') },
        };

        if (guildOwner) {
            embed.author = {
                name: guildOwner.username,
                url: guildOwner.avatarURL,
                icon_url: guildOwner.avatarURL,
            };

            embed.thumbnail = { url: guildOwner.avatarURL };
        }

        this.postEmbed(embed);
    }

    guildDelete(guild) {
        if (!this.bot.ready || guild.unvailable) return;

        const eris = this.bot.eris;

        let allMembers = 0;

        for (const guild of eris.guilds.values()) {
            allMembers += guild.members.size;
        }

        const guildOwner = guild.members.get(guild.ownerID);

        const msgs = {
            description: [
                `Removed from guild ${guild.name} (${guild.id})`,
                `Owner: ${guildOwner.username}#${guildOwner.discriminator} (${guild.ownerID})`,
                `Members: ${guild.memberCount}`,
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
            color: this.bot.config.colours.error,
            footer: { text: msgs.footer.join('\n') },
        };

        if (guildOwner) {
            embed.author = {
                name: guildOwner.username,
                url: guildOwner.avatarURL,
                icon_url: guildOwner.avatarURL,
            };

            embed.thumbnail = { url: guildOwner.avatarURL };
        }

        this.postEmbed(embed);
    }

    rawWS() {
        this.events = this.events || 0;
        this.events++;
    }

    commandSuccess({ isAdmin, command, author, message, guild }) {
        let text = `commandSuccess "${command.qualName}", Author "${author.username}#${author.discriminator}" (${author.id})`;

        if (guild) {
            text += `, Guild "${guild.name}" (${guild.id})`;
        }

        this.log(text);

        if (!isAdmin && !this.bot.config.dev) {
            const doc = {
                name: command.dbName,
                message: {
                    id: message.id,
                    content: message.content,
                    author: author.id,
                    guild: guild.id,
                },
            };

            CommandLog.create(doc)
                .catch(this.logger.error);
        }
    }

    commandError({ isAdmin, command, author, guild, message, err }) {
        let text = `commandError "${command.qualName}", Author "${author.username}#${author.discriminator}" (${author.id})`;

        if (guild) {
            text += `, Guild "${guild.name}" (${guild.id})`;
        }

        this.log(text, 'error');
        console.error(err);

        if (!isAdmin && !this.bot.config.dev) {
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

            CommandLog.create(doc)
                .catch(this.logger.error);
        }
    }
}


module.exports = Core;