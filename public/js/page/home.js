import { $ } from '../module/utils.js'
import * as wss from '../module/wss.js'
import * as store from '../module/store.js'
import * as webRTCHandler from '../module/webRTCHandler.js'
import * as constants from '../module/constants.js'

const socket = io('/')
wss.registerSocketEvents(socket) 	// Handling all WebSocket events in wss.js file

const socketIdCopyButton = $('[name=socket-id-copy-button]')
const personalCodeInput = $('[name=personal-code-input]')
const personalChatButton = $('[name=personal-chat-button]')
const personalVideoCallButton = $('[name=personal-video-call-button]')
const strangerChatButton = $('[name=stranger-chat-button]')
const strangerVideoCallButton = $('[name=stranger-video-call-button]')
const allowFromStrangerInput = $('[name=allow-from-stranger] input')

/* Handled inisde ui.showIncommingCallDialog()
const incommingCallingDialog = $('[name=incomming-call-dialog]')
const acceptCallButton = $('[name=call-in-button]')
const rejectCallButton = $('[name=call-off-button]')

acceptCallButton.addEventListener('click', () => {
	incommingCallingDialog.style.display = 'none'
})
rejectCallButton.addEventListener('click', () => {
	incommingCallingDialog.style.display = 'none'
})
*/


socketIdCopyButton.addEventListener('click', () => {
	navigator.clipboard.writeText(store.getState().socketId)
})

personalChatButton.addEventListener('click', (evt) => {
	const calleePersonalCode = personalCodeInput.value 
	if(!calleePersonalCode) return console.log('calleePersonalCode is empty')

	const args = {
		callType: constants.callType.PERSONAL_CHAT_CODE,
		calleePersonalCode
	}
	webRTCHandler.sendPreOffer(args)
})
personalVideoCallButton.addEventListener('click', (evt) => {
	const calleePersonalCode = personalCodeInput.value 
	if(!calleePersonalCode) return console.log('calleePersonalCode is empty')

	const args = {
		callType: constants.callType.PERSONAL_VIDEO_CODE,
		calleePersonalCode
	}
	webRTCHandler.sendPreOffer(args)
})
strangerChatButton.addEventListener('click', (evt) => {
	const calleePersonalCode = personalCodeInput.value 
	if(!calleePersonalCode) return console.log('calleePersonalCode is empty')

	const args = {
		callType: constants.callType.STRANGER_CHAT_CODE,
		calleePersonalCode
	}
	webRTCHandler.sendPreOffer(args)
})
strangerVideoCallButton.addEventListener('click', (evt) => {
	const calleePersonalCode = personalCodeInput.value 
	if(!calleePersonalCode) return console.log('calleePersonalCode is empty')

	const args = {
		callType: constants.callType.STRANGER_VIDEO_CODE,
		calleePersonalCode
	}
	webRTCHandler.sendPreOffer(args)
})

allowFromStrangerInput.addEventListener('change', (evt) => {
	console.log(evt.target.checked)
})