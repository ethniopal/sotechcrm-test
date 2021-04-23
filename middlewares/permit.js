// middleware for doing role-based permissions
function permit(...permittedRoles) {
	// return a middleware
	return (req, res, next) => {
		const { user } = req

		if (user.permission && permittedRoles.includes(user.permission)) {
			next() // role is allowed, so continue on the next middleware
		} else {
			res.status(403).json({ message: 'Forbidden' }) // user is forbidden
		}
	}
}

module.exports = {
	permit
}
