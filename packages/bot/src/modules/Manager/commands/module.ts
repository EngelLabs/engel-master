import Command from '../../../core/structures/Command';
import type Manager from '..';

export default new Command<Manager>({
        name: 'module',
        usage: '<module>',
        info: 'Enable or disable a module',
        examples: [
                'module moderator',
                'module logging'
        ],
        cooldown: 3000,
        requiredArgs: 1,
        alwaysEnabled: true,
        execute: function (ctx) {
                const module = ctx.app.modules.get(ctx.args[0].slice(0, 1).toUpperCase() + ctx.args[0].slice(1));

                if (!module || module.private || module.internal || module.disabled) {
                        return ctx.error(`Module \`${ctx.args[0]}\` not found.`);
                }

                const moduleName = module.dbName;

                const moduleConfig = ctx.moduleConfig = ctx.moduleConfig || {};
                moduleConfig.disabled = !moduleConfig.disabled;

                const queryString = moduleName + '.disabled';

                ctx.app.guilds.update(ctx.guildConfig.id, { $set: { [queryString]: moduleConfig.disabled } });

                return ctx.success(moduleConfig.disabled
                        ? `Module \`${module.name}\` disabled.`
                        : `Module \`${module.name}\` enabled.`
                );
        }
});
