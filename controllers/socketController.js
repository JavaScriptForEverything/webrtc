module.exports = (io) => (socket) => {
	console.log('socket connection established: ', socket.id)

	io.send('hi client')
	socket.on('message', (data) => {
		console.log(data)
	})
}