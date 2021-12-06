const Command = require('../../../structures/Command');

const penisExchangeBuddies = [
    '310232682636509184', // A1pha
    '366789046669934593', // Lysankya
    '338082875394097153', // sempai
    '329768023869358081', // timtoy
    '756389805071269908', // Mr.GodAtEverything
    '769350257430626325', // aerro
    '555081433153011727', // choppedliver
    '485963117369491466', // Equinox.
    '451546885271060481', // Rav3n
    '530853147242004501', // RiceCooker9000
];

const penisRoleId = '908561381773672499';
const noPenisRoleId = '908561414875148288';
let lastInvoke;

module.exports = new Command({
    name: 'penis',
    info: 'Shuffle the penis boys',
    hidden: true,
    requiredPermissions: ['manageRoles'],
    execute: async function (ctx) {
        if (!penisExchangeBuddies.includes(ctx.author.id)) {
            return ctx.error('You cannot exchange penises.');
        }

        if (lastInvoke && lastInvoke + 8000 > Date.now()) {
            return ctx.error('there\'s a cooldown hoe, wait a bit.');
        }

        lastInvoke = Date.now();

        const penisRole = ctx.guild.roles.get(penisRoleId);
        const noPenisRole = ctx.guild.roles.get(noPenisRoleId);
    
        if (!penisRole || !noPenisRole) {
            return ctx.error('Who the fuck deleted one of the roles bro');
        }

        const penisWielder = ctx.guild.members.filter(m => m.roles.includes(penisRoleId));
        const penisWishers = ctx.guild.members.filter(m => m.roles.includes(noPenisRoleId));

        for (const member of penisWielder) {
            ctx.eris.removeGuildMemberRole(ctx.guild.id, member.id, penisRoleId, 'only one penis')
                .catch(this.logger.error);
        }

        for (const member of penisWishers) {
            ctx.eris.removeGuildMemberRole(ctx.guild.id, member.id, noPenisRoleId, 'only one penis')
                .catch(this.logger.error);
        }

        let newPenisWielder;

        while (!ctx.guild.members.find(m => m.id === newPenisWielder)) {
            newPenisWielder = penisExchangeBuddies[Math.floor(Math.random()*penisExchangeBuddies.length)];
        }

        for (const memberID of penisExchangeBuddies) {
            if (memberID !== newPenisWielder && ctx.guild.members.find(m => m.id === memberID)) {
                ctx.eris.addGuildMemberRole(ctx.guild.id, memberID, noPenisRoleId, 'you were not chosen bitch')
                    .catch(this.logger.error);
            } else {
                ctx.eris.addGuildMemberRole(ctx.guild.id, newPenisWielder, penisRoleId, 'you are the chosen one hoe');
            }
        }

        return await ctx.success(`The penis has been assigned to <@${newPenisWielder}>`);
    }
});