import Controller from '../core/structures/Controller';

export default new Controller('/dashboard')
        .get((app, req, res) => {
                if (!req.session.user) {
                        return res.redirect('/login');
                }

                return app.renderer.dashboard(req, res);
        });
