const Command = require('../../../structures/Command');
const Tag = require('../../../models/Tag');


const tag = new Command({
    name: 'tag',
    usage: '<*tag name>',
    info: 'Find a server tag.',
    requiredArgs: 1,
    disableModuleCheck: true,
    execute: async function (ctx) {
        const name = ctx.args.join(' ');

        const tag = await Tag.findOneAndIncrement({ guild: ctx.guild.id, name });

        return tag
            ? ctx.send(tag.content).catch(() => false)
            : ctx.error(`Tag \`${name}\` not found.`);
    }
});


module.exports = tag;