const routes = {}
routes.authRoutes = require('./auth')
routes.userRoutes = require('./user')
routes.customerRoutes = require('./customer')
routes.constRoutes = require('./contact')
routes.activiteRoutes = require('./activite')
routes.attachmentRoutes = require('./attachment')
routes.noteRoutes = require('./note')

// app.use(require('./survey'))
// app.use(require('./submissions'))
// app.use(require('./export'))
// app.use(require('./import'))

module.exports = {
	routes
}
