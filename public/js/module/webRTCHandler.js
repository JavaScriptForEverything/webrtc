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

	} catch (error) {
		console.log('getUserMedia Error: ', error.message)	
	}
}

// export const getLocalPreview = () => {
// 	navigator.mediaDevices.getUserMedia(options)
// 	.then(stream => {
// 		store.setLocalStream( stream )
// 		ui.updateLocalStream( stream )
// 	}).catch(error => {
// 		console.log('getUserMedia Error: ', error.message)	
// 	})
// }


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

	/* Step-7: webrtc-step-3:
			After share offer and answer between peers, we must  share ice candidate too (which is network details) 
	*/
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

	if( callType === constants.callType.PERSONAL_CHAT_CODE ||  callType === constants.callType.PERSONAL_VIDEO_CODE ) {
		ui.showIncommingCallDialog(callType, acceptCallHandler, rejectCallHandler)
	}
}

const acceptCallHandler = (evt) => {
	createPeerConnection() 	// create peerConnection when callee accept call

	const preOfferAnswer = constants.preOfferAnswer.CALL_ACCEPTED
	sendPreOfferAnswer(preOfferAnswer)
	ui.toggleCallStyle(true) // self side
}
export const rejectCallHandler = (evt) => {
	const preOfferAnswer = constants.preOfferAnswer.CALL_REJECTED
	sendPreOfferAnswer(preOfferAnswer)
}

// Step-3: Callee send SDP answer back to caller
/* When callee get caller's offer the store callers socket.id into a variable by Step-2. 
		now send that id back with answer
*/ 
export const sendPreOfferAnswer = (preOfferAnswer) => {
	
	const data = {
		callerSocketId: connectedUserDetails.socketId,
		preOfferAnswer
	}

	wss.sendPreOfferAnswer(data)
	home.lockLeftPanel()
}


// Step-4: Caller Get SDP answer back from callee
export const handlePreOfferAnswer = ({ calleeSocketId, preOfferAnswer }) => {
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
}

// caller-side again
export const handleWebRTCAnswer = async ({ answer }) => { 				// { connectedUserSocketId, type, answer }
	if(!peerConnection) return console.log('peerConnection is empty')	
	if(!answer) return console.log('ice candidate not fire because did not get answer back')	
	
	await peerConnection.setRemoteDescription( answer )
	// offer and answer transation complite, so icecandidate event should fire in peerConnection
}


export const handleWebRTCIceCandidate = async ({ candidate }) => {
	if(!peerConnection) return console.log('peerConnection is empty')	
	if(!candidate) return console.log('no ice candidate came back')	

	await peerConnection.addIceCandidate(candidate)
}