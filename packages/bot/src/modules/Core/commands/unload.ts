import Command from '../../../core/structures/Command';
import Core from '..';

export default new Command<Core>({
        name: 'unload',
        info: 'Unload modules',
        usage: '[...modules]',
        aliases: ['u'],
        dmEnabled: true,
        execute: function (ctx) {
                if (!ctx.baseConfig.dev) return Promise.resolve();

                try {
                        var res = ctx.core.modules.unload(ctx.args.length ? ctx.args : null);
                } catch (err) {
                        return ctx.error(`Something went wrong: ${err}`);
                }

                return ctx.success(`Unloaded ${res} modules`);
        }
});
