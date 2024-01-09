import { setLocalStream } from '../module/store'

const socket = io('/')

socket.on('connect', () => {
	console.log('connected to server', socket.id)

	socket.on('message', (data) => {
		console.log(data)
		socket.send(`I got your message: you sent: ${data}`)
	})
})


setLocalStream('ok')