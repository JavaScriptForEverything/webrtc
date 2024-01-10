import * as store from './store.js'
import * as ui from './ui.js'
import * as webRTCHandler from './webRTCHandler.js'

let socketIo = null

// This function invoded in /js/page/home.js immediately
export const registerSocketEvents = (socket) => {
	socket.on('connect', () => {
	socketIo = socket

		store.setSocketId( socket.id )
		ui.updatePersonalCode( socket.id )

		// Step-2: callee side
		socket.on('pre-offer', (data) => {
			if(!data.callerSocketId) return console.log('server must have to send callerSocketId')
			webRTCHandler.handlePreOffer(data)
		})

		// Step-4: caller side
		socket.on('pre-offer-answer', (data) => {
			if(!data.calleeSocketId) return console.log('server must have to send calleeSocketId')
			webRTCHandler.handlePreOfferAnswer(data)
		})

		socket.on('message', (data) => {
			console.log(data)
			socket.send(`I got your message: you sent: ${data}`)
		})
	})
}


// Step-1: caller side
export const sendPreOffer = (data) => {
	if(!socketIo)	return console.log('socketIo is null')

	socketIo.emit('pre-offer', data)
}

// Step-3: caller side again
export const sendPreOfferAnswer = (data) => {
	socketIo.emit('pre-offer-answer', data)

}