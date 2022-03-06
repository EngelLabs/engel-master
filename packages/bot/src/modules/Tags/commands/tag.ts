import Command from '../../../core/structures/Command';
import type Tags from '..';

export default new Command<Tags>({
        name: 'tag',
        usage: '<*tag name>',
        info: 'Find a server tag.',
        requiredArgs: 1,
        disableModuleCheck: true,
        execute: async function (ctx) {
                const name = ctx.args.join(' ');

                const tag = await ctx.models.Tag.findOneAndIncrement({ guild: ctx.guild.id, name });

                return tag
                        ? ctx.send(tag.content).catch(() => false)
                        : ctx.error(`Tag \`${name}\` not found.`);
        }
});
