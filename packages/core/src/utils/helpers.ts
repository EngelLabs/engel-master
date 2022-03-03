import * as eris from 'eris';

export function capitalize(str?: string): string {
        if (!str || !str.length) return '';

        return str[0].toUpperCase() + str.slice(1);
}

export function getTopRole(eris: eris.Client, guild: eris.Guild | undefined): eris.Role | undefined {
        if (!guild) {
                return;
        }

        const me = guild.members.get(eris.user.id);

        if (!me || !me.roles.length) {
                return;
        }

        return me.roles
                .map(id => guild.roles.get(id))
                .reduce((prev, curr) => curr?.position > prev.position ? curr : prev);
}
