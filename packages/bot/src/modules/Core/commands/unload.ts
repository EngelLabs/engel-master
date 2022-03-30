import Command from '../../../core/structures/Command';
import type Core from '..';

export default new Command<Core>({
        name: 'unload',
        info: 'Unload modules',
        usage: '[...modules]',
        aliases: ['u'],
        dmEnabled: true,
        execute: async function (ctx) {
                if (!ctx.baseConfig.dev) return Promise.resolve();

                const start = Date.now();

                try {
                        var res = ctx.app.modules.unload(ctx.args.length ? ctx.args : null);

                        if (!ctx.app.modules.get('core')) {
                                await ctx.app.modules.load(['Core']);
                        }
                } catch (err) {
                        return ctx.error('Something went wrong\n' + '```\n' + (err?.toString?.() || err) + '\n```');
                }

                if (!res) {
                        return ctx.error('Could not find any modules to unload.');
                }

                const diff = Date.now() - start;

                return ctx.success(`Unloaded ${res} modules. Time expended: ${diff}ms`);
        }
});
