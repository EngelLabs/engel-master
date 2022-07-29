import Command from '../../../core/structures/Command';
import type Core from '..';

export default new Command<Core>({
        name: 'unload',
        info: 'Unload modules',
        usage: '[...modules]',
        aliases: ['u'],
        dmEnabled: true,
        execute: async function (ctx) {
                if (!ctx.staticConfig.dev) return Promise.resolve();

                const start = Date.now();
                const modules = ctx.args.length ? ctx.args : null;

                try {
                        var res = ctx.app.modules.unload(modules);

                        if (!ctx.app.modules.get('core')) {
                                await ctx.app.modules.load(['Core']);
                        }
                } catch (err) {
                        return ctx.error('Something went wrong\n' + '```\n' + (err?.toString?.() || err) + '\n```');
                }

                if (!res) {
                        return ctx.error('Could not find any modules to unload.');
                }

                ctx.redis.publish(`engel:${ctx.state}:modules:unload`, JSON.stringify(modules));

                const diff = Date.now() - start;

                return ctx.success(`Unloaded ${res} modules. Time expended: ${diff}ms`);
        }
});
