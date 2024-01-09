let connectedPeers = []

module.exports = (io) => (socket) => {
	connectedPeers.push(socket.id)
	console.log(connectedPeers)

	socket.on('pre-offer', ({ callType, calleePersonalCode }) => {
		const connectedPeer = connectedPeers.find( peerSocketId => peerSocketId === calleePersonalCode)
		if(!connectedPeer) return console.log('callee send not existing calleePersonalCode')

		const data = {
			callType,
			callerSocketId: socket.id
		}

		io.to(calleePersonalCode).emit('pre-offer', data)
	})


	socket.on('disconnect', () => {
		connectedPeers = connectedPeers.filter(socketId => socket.id !== socketId)
		console.log(connectedPeers)
	})
}