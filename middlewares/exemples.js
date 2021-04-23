const customMiddleware = (req, res, next) => {
	console.log('middleware executed!')
	next() // permet d'Exécuter les prochains middleware
}

const customMiddlewareSingle = (req, res, next) => {
	console.log('middleware Single executed!')
	next() // permet d'Exécuter les prochains middleware
}

// app.use(customMiddleware) // sera appliqué à tous

// app.get('/', (req, res) => {
// 	console.log('home')
// 	res.send('home page')
// })

// app.get('/about', customMiddlewareSingle, (req, res) => {
// 	console.log('about page')
// 	res.send('about page')
// })

module.exports = {
	customMiddleware,
	customMiddlewareSingle
}
