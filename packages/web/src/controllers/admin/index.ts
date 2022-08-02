import Controller from '../../core/structures/Controller';

export default new Controller('/admin')
        .use((app, req, res, next) => {
                if (!req.session.isAdmin) {
                        return res[403]();
                }

                return next();
        });
