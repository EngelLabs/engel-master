import Command from '../../../core/structures/Command';
import Core from '..';

export default new Command<Core>({
        name: 'load',
        info: 'Load modules',
        usage: '[...modules]',
        aliases: ['l'],
        dmEnabled: true,
        execute: function (ctx) {
                if (!ctx.baseConfig.dev) return Promise.resolve();

                try {
                        var res = ctx.core.modules.load(ctx.args.length ? ctx.args : null);
                } catch (err) {
                        return ctx.error(`Something went wrong: ${err}`);
                }

                return ctx.success(`Loaded ${res} modules`);
        }
});
