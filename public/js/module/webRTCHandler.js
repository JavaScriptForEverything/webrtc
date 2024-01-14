import * as wss from './wss.js'
import * as constants from './constants.js'
import * as ui from './ui.js'
import * as store from './store.js'
import * as home from '../page/home.js'

let connectedUserDetails = null
/* Don't be confused with caller side and callee side
		- Becasue user can only be caller or callee at a time, websocket and browser handle that.
			only focus that user has updated properly both caller side and callee side 
*/

let peerConnection = null
let dataChannel = null



export const getLocalPreview = async () => {
	const defaultConstrain = {
		audio: true,
		// video: true
		video: {
			width : { min: 200, ideal: 400, max: 600 }, 			// if w = x then h = x / (16:9) 
			height: { min: 113, ideal: 225, max: 337 }, 			// if w = 200 then h = 200 / (16:9) 
		}
	}

	try {
		const stream = await navigator.mediaDevices.getUserMedia(defaultConstrain)
		store.setLocalStream( stream )
		ui.updateLocalStream( stream )
		ui.toggleVideoCallButton(true)

	} catch (error) {
		console.log('getUserMedia Error: ', error.message, error)	
	}
}



/* must be called in both side: caller-side and callee side before sending and receiving sdp offer.
		1. callee side when he accept the call 						: in Step-2
		2. caller side when he get accepted response back : in Step-4 */
const createPeerConnection = () => {
	const configuration = {
		iceServers: [
			{
				urls: 'stun:stun.1.google.com:13902' 		// free
			}
		]
	}
	peerConnection = new RTCPeerConnection(configuration)	

	// datachannel: Step-1: create channel
	dataChannel = peerConnection.createDataChannel('chat')

	/* Step-7: webrtc-step-3:
			After share offer and answer between peers, we must  share ice candidate too (which is network details) */
	peerConnection.addEventListener('icecandidate', (evt) => {
		if(!evt.candidate) return

		const data = {
			connectedUserSocketId: connectedUserDetails.socketId, 	// backend check is user available or not
			type: constants.webRTCSignaling.ICE_CANDIDATE, 					// check event type and handle data based on it
			candidate: evt.candidate
		}
		wss.sendDataUsingWebRTCSignaling(data)
	})

	peerConnection.addEventListener('connectionstatechange', () => {
		if(peerConnection.connectionState === 'connected') {
			console.log('successfully connected with other peer')
		}
	})

	// Receiving Track
	const remoteStream = new MediaStream()
	store.setRemoteStream( remoteStream )
	ui.updateRemoteStream( remoteStream )
	peerConnection.addEventListener('track', (evt) => {
		remoteStream.addTrack(evt.track)
	})


	// add our stream to peerConnection: only for Video call should do for audio call too
	if(connectedUserDetails.callType === constants.callType.PERSONAL_VIDEO_CODE) {
		const localStream = store.getState().localStream

		for( const track of localStream.getTracks() ) {
			peerConnection.addTrack( track, localStream )
		}
	}


	// datachannel: Step-2: listen to dataChannel if created on
	peerConnection.addEventListener('datachannel', ({ channel }) => {

		// datachannel: Step-4: listen to dataChannel connection === io.on('connect)
		channel.addEventListener('open', () => {
			// console.log('data channel created')
			home.enableMessagePanel(true)

			channel.addEventListener('message', (evt) => {
				const message = JSON.parse(evt.data)
				home.addTheirMessage(message)
				// console.log(message)
			})
		})

	})

}




//------------ caller side ------------------
// Step-1: caller Send SDP offer to callee
export const sendPreOffer = ({ callType, calleePersonalCode }) => {
	if(!calleePersonalCode) return console.log('calleePersonalCode is missing')

	connectedUserDetails = {
		socketId: calleePersonalCode,
		callType
	}

	if( callType === constants.callType.PERSONAL_CHAT_CODE ||  callType === constants.callType.PERSONAL_VIDEO_CODE ) {
		wss.sendPreOffer({ callType, calleePersonalCode })
		ui.showOutgoingCallDialog(rejectCallerCallHandler)
	}

}

export const rejectCallerCallHandler = () => {
	ui.toggleCallStyle(false) // self side if rejected
}



//----------- callee side--------------
// Step-2: Callee Get SDP offer of caller via websocket server
export const handlePreOffer = ({ callType, callerSocketId }) => {
	if(!callerSocketId) return console.log('callerSocketId is missing')

	connectedUserDetails = {
		socketId: callerSocketId,
		callType
	}

	// if(false) {
	// 	// handle call not available
	// }

	if( callType === constants.callType.PERSONAL_CHAT_CODE ||  callType === constants.callType.PERSONAL_VIDEO_CODE ) {
		ui.showIncommingCallDialog(callType, acceptCallHandler, rejectCallHandler)
	}
}

const acceptCallHandler = (callType) => {
	createPeerConnection() 	// create peerConnection when callee accept call

	const preOfferAnswer = constants.preOfferAnswer.CALL_ACCEPTED
	sendPreOfferAnswer({ callType, preOfferAnswer })
	ui.toggleCallStyle(true) // self side
}
export const rejectCallHandler = (callType) => {
	const preOfferAnswer = constants.preOfferAnswer.CALL_REJECTED
	sendPreOfferAnswer({ callType, preOfferAnswer })
}

// Step-3: Callee send SDP answer back to caller
/* When callee get caller's offer the store callers socket.id into a variable by Step-2. 
		now send that id back with answer
*/ 
export const sendPreOfferAnswer = ({ callType, preOfferAnswer }) => {
	if(!connectedUserDetails) return
	
	const data = {
		callerSocketId: connectedUserDetails.socketId,
		preOfferAnswer,
		callType
	}

	wss.sendPreOfferAnswer(data)
	home.lockLeftPanel()

	const isAudioCall = callType === constants.callType.PERSONAL_CHAT_CODE
	home.isAudioCall(isAudioCall) 	// show call panel
}


// Step-4: Caller Get SDP answer back from callee
export const handlePreOfferAnswer = ({ callType, preOfferAnswer }) => {
	const { 
		CALLEE_NOT_FOUND, 
		CALL_UNAVAILABLE,
		CALL_REJECTED,
		CALL_ACCEPTED,
		CALL_CLOSED
	} = constants.preOfferAnswer

	if(preOfferAnswer === CALLEE_NOT_FOUND) {
		ui.closeOutgoingCallDialog()
		ui.showErrorCallDialog({ title: 'not found', message: 'callee not found' })
	}
	if(preOfferAnswer === CALL_UNAVAILABLE) {
		ui.closeOutgoingCallDialog()
		ui.showErrorCallDialog({ title: 'unavailable', message: 'callee busy with another call' })
	}

	if(preOfferAnswer === CALL_REJECTED) {
		ui.closeOutgoingCallDialog()
		ui.showErrorCallDialog({ title: 'rejected', message: 'your call rejected' })
	}

	if(preOfferAnswer === CALL_ACCEPTED) {
		// Step-1: Close dialog
		ui.closeOutgoingCallDialog()

		// Send WebRTC details

		// Step-2: apply call able style
		ui.toggleCallStyle(true) // other's side if success

		// Step-3: lock left panel: user can't click untill called ended
		home.lockLeftPanel()

		// Finally try to create WebRTC connection
		createPeerConnection() 	// create peerConnection when caller get call accepted response back
		sendWebRTCOffer() 			// WebRTC Step-1:

		const isAudioCall = callType === constants.callType.PERSONAL_CHAT_CODE
		home.isAudioCall(isAudioCall) 	// show call panel
	}

	if(preOfferAnswer === CALL_CLOSED) {
		ui.closeOutgoingCallDialog() 		// Step-1: 
		ui.toggleCallStyle(false) 			// Step-2: other's side if success
		home.unlockLeftPanel() 					// Step-3: 
	}

}

// caller-Side: Step-5
const sendWebRTCOffer = async () => {
	if(!peerConnection) return console.log('peerConnection is empty')	

	const offer = await peerConnection.createOffer()
	await peerConnection.setLocalDescription(offer)

	const data = {
		connectedUserSocketId: connectedUserDetails.socketId, 	// backend check is user available or not
		type: constants.webRTCSignaling.OFFER, 									// check event type and handle data based on it
		offer
	}

	wss.sendDataUsingWebRTCSignaling(data)
}


// callee-side: used in Step-6 in wss.on('webrtc-signaling')
export const handleWebRTCOffer = async ({ offer }) => { 			// { connectedUserSocketId, type, offer }
	if(!peerConnection) return console.log('peerConnection is empty')	
	if(!offer) return console.log('can not sent answer because did not get offer')	

	// make sure add offer before create answer else throw Error: => Cannot create answer in stable
	await peerConnection.setRemoteDescription(offer)

	const answer = await peerConnection.createAnswer()
	await peerConnection.setLocalDescription(answer)


	const data = {
		connectedUserSocketId: connectedUserDetails.socketId, 	// backend check is user available or not
		type: constants.webRTCSignaling.ANSWER, 								// check event type and handle data based on it
		answer
	}
	wss.sendDataUsingWebRTCSignaling(data)

	// console.log(offer)
	// home.isAudioCall(false) 	// show call panel
}

// caller-side again
export const handleWebRTCAnswer = async ({ answer }) => { 				// { connectedUserSocketId, type, answer }
	if(!peerConnection) return console.log('peerConnection is empty')	
	if(!answer) return console.log('ice candidate not fire because did not get answer back')	
	
	await peerConnection.setRemoteDescription( answer )
	// offer and answer transation complite, so icecandidate event should fire in peerConnection

	// home.isAudioCall(false) 	// show call panel
}


export const handleWebRTCIceCandidate = async ({ candidate }) => {
	if(!peerConnection) return console.log('peerConnection is empty')	
	if(!candidate) return console.log('no ice candidate came back')	

	await peerConnection.addIceCandidate(candidate)
}



export const switchBetweenCameraAndScreenSharing = async (screenSharingActive) => {

	if(screenSharingActive) {
		const { localStream } = store.getState()
		const localStreamTrack = localStream.getVideoTracks()[0]

		const senders = peerConnection.getSenders()
		const sender = senders.find(sender => sender.track.kind === localStreamTrack.kind)
		if(!sender) return console.log('localStreamTrack not found')

		ui.updateLocalStream( localStream ) 		// update scream in self camera
		sender.replaceTrack(localStreamTrack) 	// change stream track in other peer side
		store.getState().screenSharingStream.getTracks().forEach( track => track.stop() ) 	// Stop streaming
		store.setScreenSharingActive(!screenSharingActive)
		home.toggleScreenSharingStyle(false)

		// 
	} else {
		const screenSharingStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
		const screenSharingVideoTrack = screenSharingStream.getVideoTracks()[0]

		const senders = peerConnection.getSenders()
		const sender = senders.find( sender => sender.track.kind == screenSharingVideoTrack.kind)
		if(!sender) return console.log('screenSharingSender not found')
		sender.replaceTrack(screenSharingVideoTrack)

		store.setScreenSharingStream( screenSharingStream )
		store.setScreenSharingActive(!screenSharingActive)
		ui.updateLocalStream( screenSharingStream )
		home.toggleScreenSharingStyle(true)
	}
	
}

// datachannel: Step-3: send data via data channel as string
export const sendMessageUsingDataChannel = (message) => {
	const stringify = JSON.stringify(message)
	dataChannel.send(stringify) 	// network can't send object, must be string
}


// caller-side
export const sendClosingCall = () => {
	const data = {
		connectedUserSocketId: connectedUserDetails.socketId,
	}
	wss.sendClosingCallSignal(data)
	closePeerConnectionAndResetState() 	// close from caller-side

	// Step-3: Update UI: caller-side
	ui.updateUIAfterCallClose()
	connectedUserDetails = null
}

// callee-side
export const handleClosingCall = (data) => {
	closePeerConnectionAndResetState() 	// close from callee-side

	// Step-3: Update UI: caller-side
	ui.updateUIAfterCallClose()
	connectedUserDetails = null
}

const closePeerConnectionAndResetState = () => {
	if(!peerConnection) return

	// Step-1: close connection
	peerConnection.close() 					// Close connection
	peerConnection = null 					// reset connection variable

	// Step-2: reset microphone or camera: if user manually does that during chating time
	const { localStream } = store.getState()
	if(!localStream) return

	localStream.getTracks().forEach(track => track.enabled = true)


}
	// const senders = peerConnection.getSenders()
	// const sender = senders.find( sender => sender.track.kind === localStreamTrack.kind )
	// if(!sender) return console.log('sender not found for closingCall')
	// console.log(sender)

	// const stream = new MediaStream()
	// remoteStream.getTracks().forEach( track => track.stop() )
	// store.setRemoteStream(null)
	// ui.updateRemoteStream(stream)

