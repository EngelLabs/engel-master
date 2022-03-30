"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@engel/core");
class CommandCollection extends core.Collection {
    _app;
    constructor(app) {
        super();
        if (app) {
            this._app = app;
        }
    }
    register() {
        this._app.config.commands = {};
        this.all()
            .map(command => command.globalConfig)
            .forEach(c => {
            if (!c)
                return;
            this._app.config.commands[c.name] = c;
        });
        return new Promise((resolve, reject) => {
            this._app.models.Config.updateOne({ state: this._app.baseConfig.client.state }, { $set: { commands: this._app.config.commands } })
                .exec()
                .then(() => resolve())
                .catch(reject);
        });
    }
    help(commandName, prefix = '?', includeHidden = false, verbose = true) {
        const command = this.get(commandName, true);
        if (!command || ((command.module.private || command.module.internal || command.module.disabled) && !includeHidden))
            return;
        const qualName = command.qualName;
        const embed = {
            title: `Command "${qualName}" info`,
            description: `**Module:** ${command.module.name}`,
            color: this._app.config.colours.info
        };
        if (command.usage?.length) {
            embed.description += `\n**Usage:** ${prefix}${qualName} ${command.usage}`;
        }
        else {
            embed.description += `\n**Usage:** ${prefix}${qualName}`;
        }
        if (command.cooldown) {
            embed.description += `\n**Cooldown:** ${command.cooldown / 1000} seconds`;
        }
        if (command.info?.length) {
            embed.description += `\n**Info:** ${command.info}`;
        }
        if (command.aliases?.length) {
            embed.description += `\n**Aliases:** ${command.aliases.join(', ')}`;
        }
        if (command.commands) {
            const commands = [...command.commands.unique()]
                .filter(cmd => !(cmd.hidden && !includeHidden));
            const msg = commands
                .map(cmd => cmd.name)
                .join(', ');
            if (msg?.length) {
                embed.description += `\n**Subcommands [${commands.length}]:** ${msg}`;
                if (verbose) {
                    embed.footer = {
                        text: `Use "${prefix}help ${qualName} <subcommand>" for more info`
                    };
                }
            }
        }
        if (command.examples?.length) {
            embed.description += `\n**Examples:**\n${command.examples.map(e => prefix + e).join('\n')}`;
        }
        if (verbose) {
            embed.footer = embed.footer || { text: '' };
            embed.footer.text += `\nConfused? Check out "${prefix}help bot"`;
        }
        return embed;
    }
    all() {
        const ret = [...this.unique()];
        for (const command of this.unique()) {
            if (command.commands) {
                ret.push(...command.commands.all());
            }
        }
        return ret.flat();
    }
    get(key, recursive = false) {
        if (!recursive) {
            return super.get(key);
        }
        const keys = key.split(' ');
        let command = super.get(keys.shift());
        while (command?.commands && keys.length) {
            const subcommand = command.commands.get(keys.shift());
            if (!subcommand) {
                break;
            }
            command = subcommand;
        }
        return command;
    }
}
exports.default = CommandCollection;
//# sourceMappingURL=CommandCollection.js.map