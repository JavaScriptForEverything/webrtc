import * as wss from './wss.js'
import * as constants from './constants.js'
import * as ui from './ui.js'
import * as home from '../page/home.js'

let connectedUserDetails = null
/* Don't be confused with caller side and callee side
		- Becasue user can only be caller or callee at a time, websocket and browser handle that.
			only focus that user has updated properly both caller side and callee side 
*/


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


	}

	if(preOfferAnswer === CALL_CLOSED) {
		ui.closeOutgoingCallDialog() 		// Step-1: 
		ui.toggleCallStyle(false) 			// Step-2: other's side if success
		home.unlockLeftPanel() 					// Step-3: 
	}

}
