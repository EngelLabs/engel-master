import Command from '../../../core/structures/Command';
import Info from '..';

export default new Command<Info>({
        name: 'source',
        hidden: true,
        cooldown: 60000,
        execute: function (ctx) {
                return ctx.error('Not open source yet, sorry!');
        }
});
