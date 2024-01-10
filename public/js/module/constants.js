export const callType = {
	PERSONAL_CHAT_CODE : 'PERSONAL_CHAT_CODE',
	PERSONAL_VIDEO_CODE: 'PERSONAL_VIDEO_CODE',
	STRANGER_CHAT_CODE : 'STRANGER_CHAT_CODE',
	STRANGER_VIDEO_CODE: 'STRANGER_VIDEO_CODE',
}

export const preOfferAnswer = {
	CALLEE_NOT_FOUND: 'CALLEE_NOT_FOUND', 		// if try to call to a personalCode which not exists in backend
	CALL_UNAVAILABLE: 'CALL_UNAVAILABLE', 		// if already calling someone: more than 2 user not allowed by WebRTC
	CALL_ACCEPTED 	: 'CALL_ACCEPTED',
	CALL_REJECTED 	: 'CALL_REJECTED',
	CALL_CLOSED 	: 'CALL_CLOSED',
}