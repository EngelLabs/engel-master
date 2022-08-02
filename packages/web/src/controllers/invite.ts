import Controller from '../core/structures/Controller';

const inviteUrl = 'https://discord.com/api/oauth2/authorize?client_id=827788394401890374&permissions=0&scope=bot';

export default new Controller('/invite')
        .get((app, req, res) => {
                return res.redirect(inviteUrl);
        });
