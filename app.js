const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const fileUpload = require('express-fileupload')
const path = require('path')
const { MONGOURI } = require('./keys')
const PORT = 5000

require('dotenv').config()
app.use(helmet())
app.use(cors())
// permet de télécharger des attachements du serveur
app.use(express.static(path.join(__dirname, 'uploads')))

// enable files upload
app.use(
	fileUpload({
		createParentPath: true,
		limits: {
			fileSize: 8 * 1024 * 1024 * 1024 //4MB max file(s) size
		}
	})
)

//connecto to BD
mongoose.connect(MONGOURI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
})

mongoose.connection.on('connected', () => {
	console.log('connected to mongo')
})

mongoose.connection.on('error', err => {
	console.log('Error connecting', err)
})

//lists of models
require('./models/index')

app.use(express.json())

//les routes
const { routes } = require('./routes/index')

for (let route in routes) {
	app.use('/api', routes[route])
}

app.use(express.static(path.join(__dirname, 'build')))

app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.listen(PORT, () => console.log('server is running on ', PORT))
