import * as wss from './wss.js'
import * as constants from './constants.js'
import * as ui from './ui.js'

let connectedUserDetails = null

export const sendPreOffer = ({ callType, calleePersonalCode }) => {
	wss.sendPreOffer({ callType, calleePersonalCode })
}

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
	console.log(evt)
}
const rejectCallHandler = (evt) => {
	console.log(evt)
}