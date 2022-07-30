import Command from '../../../core/structures/Command';
import type Core from '..';

export default new Command<Core>({
        name: 'load',
        info: 'Load modules',
        usage: '[...modules]',
        aliases: ['l'],
        dmEnabled: true,
        execute: async function (ctx) {
                if (!ctx.staticConfig.dev) return Promise.resolve();

                const start = Date.now();
                const modules = ctx.args.length ? ctx.args : null;

                try {
                        var res = await ctx.app.modules.load(modules);
                } catch (err) {
                        return ctx.error('Something went wrong\n' + '```\n' + (err?.toString?.() || err) + '\n```');
                }

                if (!res) {
                        return ctx.error('Could not find any modules to load.');
                }

                ctx.app.ipc.publish('modules:load', modules);

                const diff = Date.now() - start;

                return ctx.success(`Loaded ${res} modules. Time expended: ${diff}ms`);
        }
});
