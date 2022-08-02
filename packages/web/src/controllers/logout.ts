import Controller from '../core/structures/Controller';

export default new Controller('/logout')
        .get((app, req, res) => {
                req.session.destroy(err => err && app.logger.get('/logout.get').error(err));

                return res.redirect('/');
        });
