import Command from '../../../core/structures/Command';
import type Core from '..';

const reload = new Command<Core>({
        name: 'reload',
        info: 'Reload modules',
        usage: '[...modules]',
        aliases: ['r'],
        dmEnabled: true,
        execute: async function (ctx) {
                if (!ctx.staticConfig.dev) return Promise.resolve();

                const start = Date.now();
                const modules = ctx.args.length ? ctx.args : null;

                try {
                        var res = await ctx.app.modules.reload(modules);
                } catch (err) {
                        return ctx.error('Something went wrong\n' + '```\n' + (err?.toString?.() || err) + '\n```');
                }

                if (!res) {
                        return ctx.error('Could not find any modules to reload.');
                }

                ctx.app.ipc.publish('modules:reload', modules);

                const diff = Date.now() - start;

                return ctx.success(`Reloaded ${res} modules. Time expended: ${diff}ms`);
        }
});

reload.command({
        name: 'config',
        info: 'Sync global configuration across all clusters',
        dmEnabled: true,
        execute: async function (ctx) {
                try {
                        await ctx.app.configure();
                } catch (err) {
                        return ctx.error(`Something went wrong: ${err}`);
                }

                return ctx.addSuccessReaction();
        }
});

export default reload;
