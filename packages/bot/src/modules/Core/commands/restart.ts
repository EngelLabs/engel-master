import Command from '../../../core/structures/Command';
import type Context from '../../../core/structures/Context';
import type Core from '..';

async function before(ctx: Context<Core>) {
        const target = ctx.command.name;
        const ids = ctx.args;
        ctx.locals = { ids: ids.map(s => `\`${s}\``).join(', ') };

        let { error } = await ctx.rpc.request('restart', { target, id: ids });

        if (error) {
                try {
                        error = JSON.stringify(error);
                } catch { }

                ctx.error(`Something went wrong: ${error}`);
        }
}

const restart = new Command<Core>({
        name: 'restart',
        info: 'Restart clusters',
        namespace: true,
        dmEnabled: true
});

restart.command({
        name: 'all',
        before: before,
        execute: function (ctx) {
                return ctx.success('Performing a rolling restart for all clusters...');
        }
});

restart.command({
        name: 'client',
        before: before,
        execute: function (ctx) {
                return ctx.success(`Performing a rolling restart for the following clients: ${ctx.locals.ids}`);
        }
});

restart.command({
        name: 'cluster',
        before: before,
        execute: function (ctx) {
                return ctx.success(`Performing a rolling restart for the following clusters: ${ctx.locals.ids}`);
        }
});

export default restart;
