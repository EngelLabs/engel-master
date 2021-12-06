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
        const roles = ctx.member.roles,
            channel = ctx.channel;
        let hasOverride = false,
            config;

        // check if command configuration override exists
        if (config = ctx.commandConfig) {
            // check channels & roles
            if (config.allowedRoles && config.allowedRoles.length && !roles.find(id => roles.includes(id))) return false;
            if (config.allowedChannels && config.allowedChannels.length && !config.allowedChannels.find(c => c.id === channel.id)) return false;
            if (config.ignoredRoles && config.ignoredRoles.length && roles.find(id => roles.includes(id))) return false;
            if (config.ignoredChannels && config.ignoredChannels.length && config.allowedChannels.find(c => c.id === channel.id)) return false;
            
            // check if an override actually exists for the command
            hasOverride = (
                (typeof config.allowedRoles !== 'undefined' && config.allowedRoles.length > 0) ||
                (typeof config.allowedChannels !== 'undefined' && config.allowedChannels.length > 0) ||
                (typeof config.ignoredRoles !== 'undefined' && config.ignoredRoles.length > 0) ||
                (typeof config.ignoredChannels !== 'undefined' && config.ignoredChannels.length > 0)
            );
        }
        
        // check if no command override exists & module configuration override exists
        if (!hasOverride && (config = ctx.moduleConfig)) {
            // check channels & roles
            if (config.allowedRoles && config.allowedRoles.length && !roles.find(id => roles.includes(id))) return false;
            if (config.allowedChannels && config.allowedChannels.length && !config.allowedChannels.find(c => c.id === channel.id)) return false;
            if (config.ignoredRoles && config.ignoredRoles.length && roles.find(id => roles.includes(id))) return false;
            if (config.ignoredChannels && config.ignoredChannels.length && config.allowedChannels.find(c => c.id === channel.id)) return false;
            
            // check if an override actually exists for the module
            hasOverride = (
                (typeof config.allowedRoles !== 'undefined' && config.allowedRoles.length > 0) ||
                (typeof config.allowedChannels !== 'undefined' && config.allowedChannels.length > 0) ||
                (typeof config.ignoredRoles !== 'undefined' && config.ignoredRoles.length > 0) ||
                (typeof config.ignoredChannels !== 'undefined' && config.ignoredChannels.length > 0)
            );
        }

        // check if no module override exists
        if (!hasOverride) {
            config = ctx.guildConfig;

            // check channels & roles
            if (config.allowedRoles && config.allowedRoles.length && !roles.find(id => roles.includes(id))) return false;
            if (config.allowedChannels && config.allowedChannels.length && !config.allowedChannels.find(c => c.id === channel.id)) return false;
            if (config.ignoredRoles && config.ignoredRoles.length && roles.find(id => roles.includes(id))) return false;
            if (config.ignoredChannels && config.ignoredChannels.length && config.allowedChannels.find(c => c.id === channel.id)) return false;
            
            // check if an override actually exists
            hasOverride = (
                (typeof config.allowedRoles !== 'undefined' && config.allowedRoles.length > 0) ||
                (typeof config.allowedChannels !== 'undefined' && config.allowedChannels.length > 0) ||
                (typeof config.ignoredRoles !== 'undefined' && config.ignoredRoles.length > 0) ||
                (typeof config.ignoredChannels !== 'undefined' && config.ignoredChannels.length > 0)
            );
        }

        // user has passed checks for any one of the three overrides above
        if (hasOverride) return true;

        // no configuration exists, check if module is enabled by default for users to use
        if (!hasOverride && ctx.module.defaultEnabled) return true;

        // no configuration exists, return false (module/command has to be configured to be used)
        return false;
    }

    hasGuildPermissions(guild, ...requiredPerms) {
        const permissions = guild.permissionsOf(this.eris.user.id);
        
        for (const perm of requiredPerms) {
            if (!permissions.has(perm)) return false;
        }

        return true;
    }

    moduleIsEnabled(moduleName, guildConfig) {
        if (!guildConfig[moduleName]) return true;
        return guildConfig[moduleName].enabled !== false;
    }

    commandIsEnabled(commandName, guildConfig, isSubcommand) {
        if (!guildConfig.commands) return true;
        if (typeof guildConfig[commandName] === 'undefined') return true;

        if (isSubcommand) {
            return guildConfig.commands[commandName] !== false;
        }
        
        return guildConfig.commands[commandName].enabled !== false;
    }
}


module.exports = Checks;