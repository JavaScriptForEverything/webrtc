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

		socket.on('pre-offer', (data) => {
			if(!data.callerSocketId) return console.log('server must have to send callerSocketId')
			webRTCHandler.handlePreOffer(data)
		})

		socket.on('message', (data) => {
			console.log(data)
			socket.send(`I got your message: you sent: ${data}`)
		})
	})
}


export const sendPreOffer = (data) => {
	if(!socketIo)	return console.log('socketIo is null')

	socketIo.emit('pre-offer', data)
}