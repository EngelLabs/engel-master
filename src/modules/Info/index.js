const Module = require('../../core/structures/Module');


class Info extends Module {
    constructor() {
        super();

        this.aliases = ['information'];
        this.info = 'Commands to provide information about the bot';
        this.allowedByDefault = true;
    }

    injectHook() {
        this.bot.commands.getHelp = this.getCommandHelp.bind(this);
        this.bot.modules.getHelp = this.getModuleHelp.bind(this);
    }

    ejectHook() {
        delete this.bot.commands.getHelp;
        delete this.bot.modules.getHelp;
    }

    /**
     * Get help for a command in the form of an embed object.
     * @param {Command} command Command object
     * @param {String} prefix Prefix to use in return value
     * @param {Boolean} includeHidden Whether to include hidden values
     * @returns {Object} embed
     */
    getCommandHelp(command, prefix = '?', includeHidden = false, verbose = true) {
        const qualName = command.qualName;

        const embed = {
            title: `Command "${qualName}" info`,
            description: `**Module:** ${command.module.name}`,
            color: this.config.colours.loading,
        };

        if (command.usage && command.usage.length) {
            embed.description += `\n**Usage:** ${prefix}${qualName} ${command.usage}`;
        } else {
            embed.description += `\n**Usage:** ${prefix}${qualName}`
        }

        if (command.cooldown) {
            embed.description += `\n**Cooldown:** ${command.cooldown / 1000} seconds`;
        }

        if (command.info && command.info.length) {
            embed.description += `\n**Info:** ${command.info}`;
        }

        if (command.aliases && command.aliases.length) {
            embed.description += `\n**Aliases:** ${command.aliases.join(', ')}`;
        }

        if (command.commands) {
            const commands = [...command.commands.unique()]
                .filter(cmd => cmd.hidden && !includeHidden ? false : true);
            const msg = commands
                .map(cmd => cmd.name)
                .join(', ');

            if (msg && msg.length) {
                embed.description += `\n**Subcommands [${commands.length}]:** ${msg}`;

                if (verbose) {
                    embed.footer = {
                        text: `Use "${prefix}help ${qualName} <subcommand>" for more info`
                    };
                }
            }
        }

        if (command.examples && command.examples.length) {
            embed.description += `\n**Examples:**\n${command.examples.map(e => prefix + e).join('\n')}`;
        }

        if (verbose) {
            embed.footer = embed.footer || { text: '' };

            embed.footer.text += `\nConfused? Check out "${prefix}help bot"`;
        }

        return embed;
    }

    /**
     * Get help for a module in the form of an embed object.
     * @param {Module} module Module object
     * @param {Boolean} includeHidden Whether to include hidden values
     * @returns {Object} embed
     */
    getModuleHelp(module, prefix = '?', includeHidden = false, verbose = true) {
        const embed = {
            title: `Module "${module.name}" info`,
            description: '',
            color: this.bot.config.colours.loading,
        };

        if (module.info) {
            embed.description += `**Info:** ${module.info}\n`;
        }

        if (module.commands) {
            const commands = module.commands
                .filter(cmd => cmd.hidden && !includeHidden ? false : true);
            const msg = commands
                .map(cmd => `\t**${cmd.name}**: ${cmd.info || 'No info provided'}`)
                .join('\n');

            if (msg && msg.length) {
                embed.description = `**Commands [${commands.length}]:**\n${msg}`;
            }
        }

        if (verbose) {
            embed.footer = embed.footer || { text: '' };

            embed.footer.text += `\nConfused? Check out "${prefix}help bot"`;
        }

        return embed;
    }
}


module.exports = Info;