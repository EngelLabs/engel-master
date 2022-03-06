import Command from '../../../core/structures/Command';
import type Core from '..';

const reload = new Command<Core>({
        name: 'reload',
        info: 'Reload modules',
        usage: '[...modules]',
        aliases: ['r'],
        dmEnabled: true,
        execute: function (ctx) {
                if (!ctx.baseConfig.dev) return Promise.resolve();

                try {
                        var res = ctx.core.modules.reload(ctx.args.length ? ctx.args : null);
                } catch (err) {
                        return ctx.error(`Something went wrong: ${err}`);
                }

                return ctx.success(`Reloaded ${res} modules`);
        }
});

reload.command({
        name: 'config',
        info: 'Sync global configuration for current process',
        dmEnabled: true,
        execute: async function (ctx) {
                try {
                        await ctx.core.configure();
                } catch (err) {
                        return ctx.error(`Something went wrong: ${err}`);
                }

                return ctx.addSuccessReaction();
        }
});

export default reload;
