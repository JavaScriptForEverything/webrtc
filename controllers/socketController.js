let connectedPeers = []

module.exports = (io) => (socket) => {
	connectedPeers.push(socket.id)
	console.log(connectedPeers)

	socket.on('pre-offer', ({ callType, calleePersonalCode }) => {
		const connectedPeer = connectedPeers.find( peerSocketId => peerSocketId === calleePersonalCode)
		// if(!connectedPeer) return console.log('calleePersonalCode missing')

		const errorData = {
			preOfferAnswer: 'CALLEE_NOT_FOUND',
			calleeSocketId: socket.id  						// pass the same variable that frontend validating for
		}
		if(!connectedPeer) return socket.emit('pre-offer-answer', errorData)


		const data = {
			callType,
			callerSocketId: socket.id
		}

		io.to(calleePersonalCode).emit('pre-offer', data)
	})

	socket.on('pre-offer-answer', ({ callerSocketId, preOfferAnswer }) => {
		const connectedPeer = connectedPeers.find( peerSocketId => peerSocketId === callerSocketId)
		if(!connectedPeer) return console.log('callee can not send answer back because callerSocketId not found ')

		// const errorData = {
		// 	preOfferAnswer: 'CALL_UNAVAILABLE',
		// 	calleeSocketId: socket.id,
		// }
		// if(!connectedPeer) return socket.emit('pre-offer-answer', errorData)


		const data = {
			preOfferAnswer,
			calleeSocketId: socket.id,
		}
		io.to(callerSocketId).emit('pre-offer-answer', data)
	})


	socket.on('webrtc-signaling', (data) => {
		const connectedPeer = connectedPeers.find( peerSocketId => peerSocketId === data.connectedUserSocketId)
		if(!connectedPeer) return console.log('webRTC must send connectedUserSocketId')

		io.to(data.connectedUserSocketId).emit('webrtc-signaling', data)
	})

	socket.on('disconnect', () => {
		connectedPeers = connectedPeers.filter(socketId => socket.id !== socketId)
		console.log(connectedPeers)
	})
}