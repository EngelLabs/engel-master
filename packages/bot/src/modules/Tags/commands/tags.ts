import * as moment from 'moment';
import type * as eris from 'eris';
import Command from '../../../core/structures/Command';
import type Tags from '..';

const tags = new Command<Tags>({
        name: 'tags',
        info: 'Commands to manage tags',
        namespace: true
});

tags.command({
        name: 'find',
        usage: '<*tag name>',
        info: 'Find a server tag',
        requiredArgs: 1,
        execute: function (ctx) {
                return ctx.app.commands.get('tag').execute(ctx);
        }
});

tags.command({
        name: 'info',
        usage: '<*tag name>',
        info: 'Get info about a server tag',
        requiredArgs: 1,
        execute: async function (ctx) {
                const name = ctx.args.join(' ');

                const tag = await ctx.mongo.tags.findOne({ guild: ctx.guild.id, name });

                if (!tag) {
                        return ctx.error(`Tag \`${name}\` not found.`);
                }

                ctx.mongo.tags
                        .updateOne({ guild: ctx.guild.id, name }, { $inc: { uses: 1 } })
                        .catch(err => ctx.logger.error(err));

                const author = ctx.eris.users.get(tag.author);

                const embed: eris.EmbedOptions = {
                        title: `Tag "${tag.name}" info`,
                        color: ctx.config.colours.info,
                        timestamp: new Date().toISOString(),
                        fields: [
                                { name: 'Content', value: tag.content },
                                { name: 'Uses', value: (tag.uses || 0).toString() },
                                { name: 'Created at', value: moment(tag.createdAt).utc().format('LLLL') }
                        ],
                        footer: {
                                text: `Author ID: ${tag.author}`
                        }
                };

                if (author) {
                        embed.author = {
                                name: author.username + '#' + author.discriminator,
                                icon_url: author.avatarURL
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
                let name: string, content: string;

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
                        await ctx.mongo.tags
                                .insertOne({
                                        guild: ctx.guild.id,
                                        author: ctx.author.id,
                                        name,
                                        content,
                                        createdAt: Date.now()
                                });
                } catch (err) {
                        if (err?.code === 11000) {
                                return ctx.error(`Tag \`${name}\` already exists.`);
                        }

                        throw err;
                }

                ctx.logger.debug(`Created "${name}" G${ctx.guild.id}.`);

                return ctx.success(`Tag \`${name}\` created.`);
        }
});

tags.command({
        name: 'edit',
        usage: '<tag name> <*new content>',
        info: "Edit a tag's content",
        requiredArgs: 2,
        execute: async function (ctx) {
                let name: string, content: string;

                if (ctx.args[0].startsWith('"')) {
                        const args = ctx.args.join(' ').slice(1);

                        const idx = args.indexOf('"');
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

                const result = await ctx.mongo.tags.updateOne({ guild: ctx.guild.id, name }, { $set: { content } });

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

                const result = await ctx.mongo.tags.deleteOne({ guild: ctx.guild.id, name });

                if (result.deletedCount) {
                        ctx.logger.debug(`Deleted "${name}" G${ctx.guild.id}.`);
                }

                return result.deletedCount
                        ? ctx.success(`Tag \`${name}\` deleted.`)
                        : ctx.error(`Tag \`${name}\` not found.`);
        }
});

export default tags;
