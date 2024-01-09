import { $ } from './utils.js'
import * as constants from './constants.js'
import * as elements from './elements.js'

/* How this page loaded or executed ?
		- We import 
				home.pug 	=>  home.js
				wss.js 		=>  home.js
				ui.js 		=>  wss.js

				=> so home.js has access ui.js too
*/



export const updatePersonalCode = (socketId) => {
	$('[name=show-socket-id]').textContent = socketId
}

export const showIncommingCallDialog = (callType, acceptCallHandler, rejectCallHandler) => {
	const exactCallType = callType === constants.callType.PERSONAL_CHAT_CODE ? 'Chat' : 'Video'
	// const incommingCallDialog = elements.getIncommingCallDialog(exactCallType, acceptCallHandler, rejectCallHandler)

	const incommingCallingDialog = $('[name=incomming-call-dialog]')
	const dialogTitle = $('[name=dialog-title]')
	const acceptCallButton = $('[name=call-in-button]')
	const rejectCallButton = $('[name=call-off-button]')

	dialogTitle.textContent = `incomming ${exactCallType} call`
	incommingCallingDialog.style.display = 'flex'

	acceptCallButton.addEventListener('click', (evt) => {
		incommingCallingDialog.style.display = 'none'
		acceptCallHandler(evt)
	})
	rejectCallButton.addEventListener('click', (evt) => {
		incommingCallingDialog.style.display = 'none'
		rejectCallHandler(evt)
	})
}

// showIncommingCallDialog()