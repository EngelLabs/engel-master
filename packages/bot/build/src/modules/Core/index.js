"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris = require("eris");
const Module_1 = require("../../core/structures/Module");
const Command_1 = require("../../core/structures/Command");
const Context_1 = require("../../core/structures/Context");
const Permission_1 = require("../../core/helpers/Permission");
const baseConfig_1 = require("../../core/utils/baseConfig");
const basePrefixes = [`<@${baseConfig_1.default.client.id}> `, `<@!${baseConfig_1.default.client.id}> `];
class Core extends Module_1.default {
    cooldowns;
    globalCooldowns;
    permissions;
    constructor() {
        super();
        this.private = true;
        this.internal = true;
        this.info = 'Core module';
    }
    injectHook() {
        this.cooldowns = new Map();
        this.globalCooldowns = new Map();
        this.permissions = new Permission_1.default(this.app);
        this.tasks = [];
        this.listeners = [];
        this.tasks.push([this.clearCooldowns.bind(this), 5000]);
        this.listeners.push(this.messageCreate.bind(this));
        const admin = new Command_1.default({
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
    commandCheck(ctx) {
        return ctx.author.id === ctx.config.author.id;
    }
    clearCooldowns() {
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
    async postEmbed(embed) {
    }
    messageCreate(payload) {
        if (payload.isAdmin) {
            return this.handleAdmin(payload);
        }
        return this.handleCommand(payload);
    }
    handleAdmin(p) {
        const ctx = this.resolveContext(p);
        if (!ctx) {
            return Promise.resolve();
        }
        return this.executeCommand(ctx);
    }
    async handleCommand(p) {
        const { isTester, message } = p;
        if (message.author.bot)
            return;
        const isTesting = p.isTesting;
        const guildConfig = p.guildConfig;
        if (baseConfig_1.default.dev && message.guildID && (!isTester || !isTesting))
            return;
        if (guildConfig) {
            if (guildConfig.isIgnored)
                return;
            if (guildConfig.isPremium && (!baseConfig_1.default.client.premium || guildConfig.hasPremium))
                return;
        }
        const config = this.config;
        if (config.adminOnly || config.paused)
            return;
        if (!config.dmCommands && !message.guildID)
            return;
        if (config.users.blacklisted.includes(message.author.id))
            return;
        const last = this.globalCooldowns.get(message.author.id);
        if (last) {
            if (Date.now() - last <= config.globalCooldown)
                return;
            this.globalCooldowns.delete(message.author.id);
        }
        const ctx = this.resolveContext(p);
        if (!ctx)
            return;
        const { command, module } = ctx;
        if (!command.disableModuleCheck && module.commandCheck) {
            let canRun = module.commandCheck(ctx);
            if (typeof canRun !== 'boolean') {
                canRun = await canRun;
            }
            if (!canRun)
                return;
        }
        if (message.guildID && !(this.permissions.isOwner(ctx.guild, ctx.author) ||
            this.permissions.isServerAdmin(ctx.guild, ctx.author) ||
            this.canInvoke(ctx)))
            return;
        if (command.check) {
            let canRun = command.check(ctx);
            if (typeof canRun !== 'boolean') {
                canRun = await canRun;
            }
            if (!canRun)
                return;
        }
        const key = message.author.id + command.qualName;
        const activeCooldown = this.cooldowns.get(key);
        if (activeCooldown && (Date.now() - activeCooldown.time) <= activeCooldown.cooldown) {
            if (!activeCooldown.warned && config.cooldownWarn) {
                activeCooldown.warned = true;
                ctx.send(`${message.author.mention}, Not so fast!`)
                    .then(msg => {
                    if (!msg || !config.cooldownWarnDelete)
                        return;
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
        if (message.guildID && !command.alwaysEnabled) {
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
    resolveContext(payload) {
        const { message, isAdmin } = payload;
        const isTesting = payload.isTesting;
        const guildConfig = payload.guildConfig;
        let prefixes;
        if (!message.guildID) {
            prefixes = this.config.prefixes.dm;
        }
        else {
            prefixes = guildConfig.prefixes;
        }
        prefixes = basePrefixes.concat(prefixes);
        const adminPrefix = baseConfig_1.default.client.name + '?';
        if (isAdmin) {
            prefixes = prefixes.concat(this.config.prefixes.private);
            prefixes.push(adminPrefix);
        }
        prefixes.sort((a, b) => b.length - a.length);
        const prefix = prefixes.find(str => message.content.startsWith(str));
        if (typeof prefix !== 'string')
            return;
        if (message.guildID && guildConfig.client !== baseConfig_1.default.client.name && prefix !== adminPrefix) {
            if (!isTesting && message.channel.guild.ownerID !== this.eris.user.id) {
                this.eris.leaveGuild(guildConfig.id).catch(() => false);
            }
            return;
        }
        const args = message.content.slice(prefix.length).replace(/ {2,}/g, ' ').split(' ');
        if (!args.length)
            return;
        let command = this.app.commands.get(args.shift());
        if (!command)
            return;
        const module = command.module;
        while (command.commands && args.length) {
            const subcommand = command.commands.get(args[0]);
            if (!subcommand)
                break;
            args.shift();
            command = subcommand;
        }
        if (!message.guildID && !command.dmEnabled)
            return;
        const ctx = new Context_1.default(this.app, {
            args,
            prefix: prefix || '?',
            message,
            command,
            module,
            isAdmin,
            guildConfig
        });
        return ctx;
    }
    canInvoke(ctx) {
        const roles = ctx.member?.roles, channel = ctx.channel;
        let canInvoke = false, overrideExists = false;
        const checkPerms = (c) => {
            if (!c || typeof c === 'boolean')
                return false;
            if (c.allowedRoles?.length) {
                if (!overrideExists)
                    overrideExists = true;
                if (!c.allowedRoles.find((id) => roles.includes(id)))
                    return false;
            }
            if (c.allowedChannels?.length) {
                if (!overrideExists)
                    overrideExists = true;
                if (!c.allowedChannels.find((id) => id === channel.id))
                    return false;
            }
            if (c.ignoredRoles?.length) {
                if (!overrideExists)
                    overrideExists = true;
                if (c.ignoredRoles.find((id) => roles.includes(id)))
                    return false;
            }
            if (c.ignoredChannels?.length) {
                if (!overrideExists)
                    overrideExists = true;
                if (c.ignoredChannels.find((id) => id === channel.id))
                    return false;
            }
            if (overrideExists)
                return true;
            return false;
        };
        canInvoke = checkPerms(ctx.commandConfig);
        if (!canInvoke && !overrideExists) {
            canInvoke = checkPerms(ctx.moduleConfig);
        }
        if (!canInvoke && !overrideExists) {
            canInvoke = checkPerms(ctx.guildConfig);
        }
        if (!overrideExists && ctx.module.allowedByDefault) {
            return true;
        }
        return canInvoke;
    }
    deleteCommand(ctx) {
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
            }
            else if (moduleConfig?.delCommands !== undefined) {
                return moduleConfig.delCommands ? del() : resolve();
            }
            else if (ctx.guildConfig.delCommands) {
                return del();
            }
            resolve();
        });
    }
    async executeCommand(ctx) {
        const { command, prefix, isAdmin, args, message } = ctx;
        if (args.length < command?.requiredArgs) {
            const embed = this.app.commands.help(command.qualName, prefix, isAdmin);
            if (!embed) {
                this.log(new Error('Unreachable code'), 'error');
            }
            ctx.send({ embed });
            return;
        }
        if (message.guildID && command.requiredPermissions) {
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
            let execute;
            if (message.guildID)
                this.deleteCommand(ctx);
            if (command.namespace) {
                execute = () => {
                    const embed = this.app.commands.help(command.qualName, prefix, isAdmin);
                    return ctx.send({ embed });
                };
            }
            else {
                execute = () => command.execute(ctx);
            }
            if (command.before) {
                const _p = command.before(ctx);
                if (_p instanceof Promise) {
                    await _p;
                }
            }
            if (!ctx.done) {
                await execute();
                if (!ctx.done && command.after) {
                    const _p = command.after(ctx);
                    if (_p instanceof Promise) {
                        await _p;
                    }
                }
            }
            this.app.emit('command', command.dbName);
        }
        catch (err) {
            this.log(err, 'error');
            return ctx.error('Sorry, something went wrong.');
        }
        this.commandSuccess(ctx);
    }
    guildCreate({ guild }) {
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
        const embed = {
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
    guildDelete({ guild }) {
        if (!(guild instanceof eris.Guild)) {
            return;
        }
        const erisClient = this.eris;
        let allMembers = 0;
        for (const guild of erisClient.guilds.values()) {
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
                `Total guild count: ${erisClient.guilds.size}`,
                `Total member count: ${allMembers}`,
                `Total user count: ${erisClient.users.size}`
            ]
        };
        const embed = {
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
    commandSuccess({ isAdmin, command, author, message, guild }) {
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
}
exports.default = Core;
//# sourceMappingURL=index.js.map