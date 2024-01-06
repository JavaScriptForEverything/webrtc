const path = require('path')
const livereload = require('livereload') 									// for reload browser
const connectLivereload = require('connect-livereload') 	// for reload browser
const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')

const publicDirectory = path.join(process.cwd(), 'public')
const PORT = process.env.PORT || 5000
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

app.set('view engine', 'pug')
app.use(express.static( publicDirectory ))

// -----[ For LiveReload ]-----
// Used for development purpose: To reload browser on file changes
if(process.env.NODE_ENV === 'development') {
	const livereloadServer = livereload.createServer() 				// for reload browser
	livereloadServer.watch(publicDirectory)
	livereloadServer.server.once('connection', () => {
		setTimeout(() => livereloadServer.refresh('/') , 10);
	})

	app.use(connectLivereload()) 													// for reload browser
}


app.get('/', (req, res, next) => {
	const payload = {
		title: 'Home Page',
	}

	res.render('page/home', payload)
})

io.on('connect', (socket) => {
	console.log('socket connection established: ', socket.id)

	socket.send('hi client')
	socket.on('message', (data) => {
		console.log(data)
	})
})

httpServer.listen(PORT, () => console.log(`server on: http://localhost:${PORT}`))