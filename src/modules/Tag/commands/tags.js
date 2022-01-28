const Command = require('../../../core/structures/Command');
const moment = require('moment');


const tags = new Command({
        name: 'tags',
        info: 'Commands to manage tags',
        namespace: true,
});

tags.command({
        name: 'find',
        usage: '<*tag name>',
        info: 'Find a server tag',
        requiredArgs: 1,
        execute: function (ctx) {
                return ctx.bot.commands.get('tag').execute(ctx);
        }
});

tags.command({
        name: 'info',
        usage: '<*tag name>',
        info: 'Get info about a server tag',
        requiredArgs: 1,
        execute: async function (ctx) {
                const name = ctx.args.join(' ');

                const tag = await ctx.models.Tag.findOneAndIncrement({ guild: ctx.guild.id, name });

                if (!tag) {
                        return ctx.error(`Tag \`${name}\` not found.`);
                }

                const author = ctx.eris.users.get(tag.author);

                const embed = {
                        title: `Tag "${tag.name}" info`,
                        color: ctx.config.colours.info,
                        timestamp: new Date().toISOString(),
                        fields: [
                                { name: 'Content', value: tag.content },
                                { name: 'Uses', value: tag.uses || 0 },
                                { name: 'Created at', value: moment(tag.createdAt).utc().format('LLLL') },
                        ],
                        footer: {
                                text: `Author ID: ${tag.author}`,
                        }
                };
                
                if (author) {
                        embed.author = {
                                name: author.username + '#' + author.discriminator,
                                icon_url: author.avatarURL,
                        };
                }

                if (tag.editedAt) {
                        embed.fields.push({ name: 'Last edit', value: moment(tag.editedAt).utc().format('LLLL') });
                }

                return ctx.send({ embed });
        }
});

tags.command({
        name: 'create',
        usage: '<tag name> <*tag content>',
        info: 'Create a server tag',
        requiredArgs: 2,
        execute: async function (ctx) {
                let name, content;

                if (ctx.args[0].startsWith('"')) {
                        const text = ctx.args.join(' ').slice(1);

                        const idx = text.indexOf('"');

                        if (idx !== -1) {
                                name = text.substr(0, idx).trim();
                                content = text.slice(idx + 1).trim();
                        }
                }

                if (name === undefined && content === undefined) {
                        name = ctx.args.shift();
                        content = ctx.args.join(' ');
                }

                if (!name || !name.length) return ctx.error('Missing tag name.');
                if (!content || !content.length) return ctx.error('Missing tag content.');

                try {
                        await ctx.models.Tag
                                .create({ guild: ctx.guild.id, author: ctx.author.id, name, content });
                } catch (err) {
                        if (err?.code === 11000) {
                                return ctx.error(`Tag \`${name}\` already exists.`);
                        }

                        throw err;
                }

                ctx.log(`Created "${name}" G${ctx.guild.id}.`);

                return ctx.success(`Tag \`${name}\` created.`)
        }
});



tags.command({
        name: 'edit',
        usage: '<tag name> <*new content>',
        info: "Edit a tag's content",
        requiredArgs: 2,
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
        requiredArgs: 1,
        execute: async function (ctx) {
                const name = ctx.args.join(' ');

                const result = await ctx.models.Tag.deleteOne({ guild: ctx.guild.id, name });

                if (result.deletedCount) {
                        ctx.log(`Deleted "${name}" G${ctx.guild.id}.`);
                }

                return result.deletedCount
                        ? ctx.success(`Tag \`${name}\` deleted.`)
                        : ctx.error(`Tag \`${name}\` not found.`);

        }
});


module.exports = tags;