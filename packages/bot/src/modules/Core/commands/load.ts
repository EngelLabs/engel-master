import Command from '../../../core/structures/Command';
import type Core from '..';

export default new Command<Core>({
        name: 'load',
        info: 'Load modules',
        usage: '[...modules]',
        aliases: ['l'],
        dmEnabled: true,
        execute: function (ctx) {
                if (!ctx.baseConfig.dev) return Promise.resolve();

                const start = Date.now();

                try {
                        var res = ctx.core.modules.load(ctx.args.length ? ctx.args : null);
                } catch (err) {
                        return ctx.error('Something went wrong\n' + '```\n' + (err?.toString?.() || err) + '\n```');
                }

                if (!res) {
                        return ctx.error('Could not find any modules to load.');
                }

                const diff = Date.now() - start;

                return ctx.success(`Loaded ${res} modules. Time expended: ${diff}ms`);
        }
});
