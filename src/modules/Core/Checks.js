class Checks {
    constructor(core) {
        this.bot = core.bot;
        this.eris = core.eris;
    }

    isOwner(ctx) {
        return ctx.author.id === ctx.guild.ownerID;
    }

    isServerAdmin(ctx) {
        const perms = ctx.member.permissions;

        return perms.has('manageGuild') || perms.has('administrator');
    }

    isAdmin(ctx) {
        return ctx.author.id === this.bot.config.author.id;
    }

    canInvoke(ctx) {
        const roles = ctx.member.roles;
        const channel = ctx.channel;

        let canInvoke = false;
        let overrideExists = false;

        const checkPerms = c => {
            if (!c) return false;

            if (c.allowedRoles && c.allowedRoles.length) {
                overrideExists = true;

                if (!c.allowedRoles.find(id => roles.includes(id))) return false;
            }

            if (c.allowedChannels && c.allowedChannels.length) {
                overrideExists = true;

                if (!c.allowedChannels.find(id => id === channel.id)) return false;
            }

            if (c.ignoredRoles && c.ignoredRoles.length) {
                overrideExists = true;

                if (c.ignoredRoles.find(id => roles.includes(id))) return false;
            }

            if (c.ignoredChannels && c.ignoredChannels.length) {
                overrideExists = true;

                if (c.ignoredChannels.find(id => id === channel.id)) return false;
            }

            if (overrideExists) return true;

            return false;
        }

        canInvoke = checkPerms(ctx.commandConfig);

        if (!canInvoke && !overrideExists) {
            canInvoke = checkPerms(ctx.moduleConfig);
        }

        if (!canInvoke && !overrideExists) {
            canInvoke = checkPerms(ctx.guildConfig);
        }

        if (!canInvoke && !overrideExists && ctx.module.defaultEnabled) {
            return true;
        }

        console.log(canInvoke);

        return canInvoke;
    }

    hasGuildPermissions(guild, ...requiredPerms) {
        const permissions = guild.permissionsOf(this.eris.user.id);

        for (const perm of requiredPerms) {
            if (!permissions.has(perm)) return false;
        }

        return true;
    }

    moduleIsEnabled(module, guildConfig) {
        if (!guildConfig[module.dbName]) return true;
        
        return !guildConfig[moduleName].disabled;
    }

    commandIsEnabled(commandName, guildConfig, isSubcommand) {
        if (!guildConfig.commands) return true;
        if (typeof guildConfig[commandName] === 'undefined') return true;

        if (isSubcommand) {
            return guildConfig.commands[commandName] !== false;
        }

        return !!guildConfig.commands[commandName].disabled;
    }
}


module.exports = Checks;