const Command = require('../../../core/structures/Command');


const tags = new Command({
    name: 'tags',
    info: 'Commands to manage tags',
    namespace: true,
});

tags.command({
    name: 'find',
    usage: '<*tag name>',
    info: 'Find a server tag',
    rich: true,
    requiredArgs: 1,
    execute: function (ctx) {
        return ctx.bot.commands.get('tag').execute(ctx);
    }
});

tags.command({
    name: 'info',
    usage: '<*tag name>',
    info: 'Get info about a server tag',
    rich: true,
    requiredArgs: 1,
    execute: async function (ctx) {
        const name = ctx.args.join(' ');

        const tag = await ctx.models.Tag.findOneAndIncrement({ guild: ctx.guild.id, name });

        if (!tag) return ctx.error(`Tag \`${name}\` not found.`);

        const author = ctx.eris.users.get(tag.author);

        const embed = {
            title: `Tag "${tag.name}" (uses: ${tag.uses || 0})`,
            color: ctx.config.colours.loading,
            timestamp: new Date().toISOString(),
            fields: [
                { name: 'Content', value: tag.content },
                { name: 'Created at', value: tag.createdAt },
            ],
            footer: {
                text: `Author ID: ${tag.author}`,
            }
        };

        if (author) {
            embed.author = {
                name: author.name,
                icon_url: author.avatarUrl,
            };
        }

        if (tag.editedAt) {
            embed.fields.push({ name: 'Last edit', value: tag.editedAt });
        }

        return ctx.send({ embed });
    }
});

tags.command({
    name: 'create',
    usage: '<tag name> <*tag content>',
    info: 'Create a server tag',
    rich: true,
    requiredArgs: 1,
    execute: async function (ctx) {
        let name, content;

        if (ctx.args[0].startsWith('"')) {
            const args = ctx.args.join(' ').slice(1);

            idx = args.indexOf('"');
            if (idx !== -1) {
                name = args.substr(0, idx).trim();
                content = args.slice(idx + 1).trim();
            }
        }

        if (name === undefined && content === undefined) {
            name = ctx.args[0];
            content = ctx.args.slice(1).join(' ');
        }

        if (!name || !name.length) return ctx.error('Missing tag name.');
        if (!content || !content.length) return ctx.error('Missing tag content.');
        if (tags.commands.get(name.split(' ')[0]) || tags.commands.get(name)) {
            return ctx.error(`\`${name}\` cannot be used as a tag name.`);
        }

        try {
            await ctx.models.Tag.create({ guild: ctx.guild.id, author: ctx.author.id, name, content }).exec();
        } catch {
            // Duplicate key error most likely.
            return ctx.error(`Tag \`${name}\` already exists.`);
        }

        ctx.logger.info(`[Modules.Tag] Created "${name}" G${ctx.guild.id}.`);

        return ctx.success(`Tag \`${name}\` created.`)
    }
});

tags.command({
    name: 'name',
    usage: '<tag name> <*new name>',
    info: 'Edit a tag\'s name',
    rich: true,
    requiredArgs: 1,
    execute: async function (ctx) {
        let name, newName;

        if (ctx.args[0].startsWith('"')) {
            const args = ctx.args.join(' ').slice(1);

            idx = args.indexOf('"');
            if (idx !== -1) {
                name = args.substr(0, idx).trim();
                newName = args.slice(idx + 1).trim();
            }
        }

        if (name === undefined && newName === undefined) {
            name = ctx.args[0];
            newName = ctx.args.slice(1).join(' ');
        }

        if (!name || !name.length) return ctx.error('Missing tag name.');
        if (!newName || !newName.length) return ctx.error('Missing new tag name.');
        if (tags.commands.get(newName) || tags.commands.get(newName.split(' ')[0])) {
            return ctx.error(`\`${name}\` cannot be used as a tag name.`);
        }

        const result = await ctx.models.Tag.updateOne({ guild: ctx.guild.id, name }, { $set: { name: newName } }).exec();

        return result.matchedCount
            ? ctx.success(`Tag \`${name}\` edited. New name: \`${newName}\`.`)
            : ctx.error(`Tag \`${name}\` not found.`);
    }
});


tags.command({
    name: 'edit',
    usage: '<tag name> <*new content>',
    info: 'Edit a tag\'s content',
    aliases: [
        'content',
    ],
    rich: true,
    requiredArgs: 1,
    execute: async function (ctx) {
        let name, content;

        if (ctx.args[0].startsWith('"')) {
            const args = ctx.args.join(' ').slice(1);

            idx = args.indexOf('"');
            if (idx !== -1) {
                name = args.substr(0, idx).trim();
                content = args.slice(idx + 1).trim();
            }
        }

        if (name === undefined && content === undefined) {
            name = ctx.args[0];
            content = ctx.args.slice(1).join(' ');
        }

        if (!name || !name.length) return ctx.error('Missing tag name.');
        if (!content || !content.length) return ctx.error('Missing new tag content.');

        const result = await ctx.models.Tag.updateOne({ guild: ctx.guild.id, name }, { $set: { content } }).exec();

        return result.modifiedCount
            ? ctx.success(`Tag \`${name}\` edited. New content: \`${content}\`.`)
            : ctx.error(`Tag \`${name}\` not found.`);
    }
});

tags.command({
    name: 'delete',
    usage: '<*tag name>',
    info: 'Delete a server tag',
    rich: true,
    requiredArgs: 1,
    execute: async function (ctx) {
        const filter = {
            guild: ctx.guild.id,
            author: ctx.author.id,
            name: ctx.args.join(' '),
        };

        const result = await ctx.models.Tag.deleteOne(filter).exec();

        if (result.deletedCount) {
            ctx.logger.info(`[Modules.Tag] Deleted "${name}" G${ctx.guild.id}.`);
        }

        return result.deletedCount
            ? ctx.success(`Tag ${filter.name} deleted.`)
            : ctx.error(`Tag \`${filter.name}\` not found.`);

    }
});


module.exports = tags;