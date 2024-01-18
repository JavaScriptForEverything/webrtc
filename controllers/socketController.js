let connectedPeers = []
let callingPeers = []

const callState = {
	CALL_AVAILABLE: 'CALL_AVAILABLE',
	CALL_UNAVAILABLE: 'CALL_UNAVAILABLE',
	ONLY_CHAT_CALL_AVAILABLE: 'ONLY_CHAT_CALL_AVAILABLE',
}

module.exports = (io) => (socket) => {
	connectedPeers.push(socket.id)
	console.log(connectedPeers)

	// const [ callerId, calleeId ] = callingPeers

	// if( callingPeers.includes(callerId) && callingPeers.includes(calleeId) ) {
	// 	io.emit('call-state', { callState: callState.CALL_UNAVAILABLE })
	// }

	socket.on('pre-offer', ({ callType, calleePersonalCode }) => {
		const connectedPeer = connectedPeers.find( peerSocketId => peerSocketId === calleePersonalCode)
		// if(!connectedPeer) return console.log('calleePersonalCode missing')

		const errorData = {
			preOfferAnswer: 'CALLEE_NOT_FOUND',
			calleeSocketId: socket.id,  						// pass the same variable that frontend validating for
			callType
		}
		if(!connectedPeer) return socket.emit('pre-offer-answer', errorData)

		const data = {
			callType,
			callerSocketId: socket.id
		}
		io.to(calleePersonalCode).emit('pre-offer', data)

		callingPeers.push(socket.id) 	// Step-1: save callerSocketId
	})

	socket.on('pre-offer-answer', ({ callerSocketId, callType, preOfferAnswer }) => {
		const connectedPeer = connectedPeers.find( peerSocketId => peerSocketId === callerSocketId)
		if(!connectedPeer) return console.log('callee can not send answer back because callerSocketId not found ')

		// const errorData = {
		// 	preOfferAnswer: 'CALL_UNAVAILABLE',
		// 	calleeSocketId: socket.id,
		// }
		// if(!connectedPeer) return socket.emit('pre-offer-answer', errorData)

		const data = {
			callType,
			preOfferAnswer,
			calleeSocketId: socket.id,
		}
		io.to(callerSocketId).emit('pre-offer-answer', data)

		callingPeers.push(socket.id) 	// Step-2: save calleeSocketId
	})


	socket.on('webrtc-signaling', (data) => {
		const connectedPeer = connectedPeers.find( peerSocketId => peerSocketId === data.connectedUserSocketId)
		if(!connectedPeer) return console.log('webRTC must send connectedUserSocketId')


		/*  Step-3: check already connected both peers or not
				callerSocketId = socket.id, 	calleeSocketId = data.connectedUserSocketId
		*/
		// if(callingPeers.includes(socket.id) && callingPeers.includes(data.connectedUserSocketId)) {
		// 	io.emit('call-state', { callState: callState.CALL_UNAVAILABLE })
		// }

		io.to(data.connectedUserSocketId).emit('webrtc-signaling', data)
	})

	socket.on('webrtc-close-connection', (data) => {
		const connectedPeer = connectedPeers.find( peerSocketId => peerSocketId === data.connectedUserSocketId)
		if(!connectedPeer) return console.log('WebRTC: webrtc-close-connection failed. missing { connectedUserSocketId }')

		io.to(data.connectedUserSocketId).emit('webrtc-close-connection', data)

		// // Step-5: on call close allow to connect again
		io.emit('call-state', { callState: callState.CALL_AVAILABLE })
		callingPeers = []
	})


	socket.on('typing', ({ calleeId }) => {
		const connectedPeer = connectedPeers.find( peerSocketId => peerSocketId === calleeId)
		if(!connectedPeer) return console.log('typingIndicator: failed')

		io.to(calleeId).emit('typing', { calleeId })
	})


	socket.on('disconnect', () => {
		connectedPeers = connectedPeers.filter(socketId => socket.id !== socketId)
		console.log(connectedPeers)
	})
}


// const isAlreadyEngaged = (callerId, calleeId) => {
// 	if(callingPeers.includes(callerId) && callingPeers.includes(calleeId)) {
// 		io.emit('call-state', { callState: callState.CALL_UNAVAILABLE })
// 	}
// }