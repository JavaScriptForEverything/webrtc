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


const incommingCallingDialog = $('[name=incomming-call-dialog]')
const outgoingCallDialog = $('[name=outgoing-call-dialog]')
const errorCallDialog = $('[name=error-call-dialog]')

const callInputCheckbox = $('#call-button')
callInputCheckbox.checked = false

export const toggleCallStyle = (isCalled = false) => {
	callInputCheckbox.checked = isCalled
}


export const updatePersonalCode = (socketId) => {
	$('[name=show-socket-id]').textContent = socketId
}

// callee side
export const showIncommingCallDialog = (callType, acceptCallHandler, rejectCallHandler) => {
	const exactCallType = callType === constants.callType.PERSONAL_CHAT_CODE ? 'Chat' : 'Video'
	// const incommingCallDialog = elements.getIncommingCallDialog(exactCallType, acceptCallHandler, rejectCallHandler)

	// const incommingCallingDialog = $('[name=incomming-call-dialog]')
	const dialogTitle = $('[name=incomming-call-dialog] [name=dialog-title]')
	const acceptCallButton = $('[name=incomming-call-dialog] [name=call-in-button]')
	const rejectCallButton = $('[name=incomming-call-dialog] [name=call-off-button]')

	dialogTitle.textContent = `incomming ${exactCallType} call`
	incommingCallingDialog.style.display = 'flex'

	acceptCallButton.addEventListener('click', (evt) => {
		closeIncommingCallDialog()
		acceptCallHandler(evt)
	})
	rejectCallButton.addEventListener('click', (evt) => {
		closeIncommingCallDialog()
		rejectCallHandler(evt)
	})
}
export const closeIncommingCallDialog = () => {
	incommingCallingDialog.style.display = 'none'
}

// caller side
export const showOutgoingCallDialog = (rejectCallHandler) => {

	const rejectCallButton = $('[name=outgoing-call-dialog] [name=call-off-button]')
	outgoingCallDialog.style.display = 'flex'

	rejectCallButton.addEventListener('click', (evt) => {
		closeOutgoingCallDialog()
		rejectCallHandler(evt)
	})
}
export const closeOutgoingCallDialog = () => {
	outgoingCallDialog.style.display = 'none'
}


export const showErrorCallDialog = ({ title='', message= '', delay=4000 }) => {
	const dialogTitle = $('[name=error-call-dialog] [name=dialog-title]')
	const dialogMessage = $('[name=error-call-dialog] [name=dialog-message]')

	errorCallDialog.style.display = 'flex'
	dialogTitle.textContent = title
	dialogMessage.textContent = message

	setTimeout(() => {
		errorCallDialog.style.display = 'none'
		dialogTitle.textContent = ''
		dialogTitle.message = ''
	}, delay);

}
export const closeErrorCallDialog = () => {
	errorCallDialog.style.display = 'none'
}
// showErrorCallDialog({ title: 'testing', message: 'again testing' })