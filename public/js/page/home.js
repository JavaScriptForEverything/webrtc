const socket = io('/')

socket.on('connection', () => {
	console.log('connected to server')
})

socket.on('message', (data) => {
	console.log(data)
	socket.send(`I got your message: you sent: ${data}`)
})

