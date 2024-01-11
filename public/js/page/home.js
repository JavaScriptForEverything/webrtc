import { $ } from '../module/utils.js'
import * as wss from '../module/wss.js'
import * as store from '../module/store.js'
import * as webRTCHandler from '../module/webRTCHandler.js'
import * as constants from '../module/constants.js'
import * as ui from '../module/ui.js'

const socket = io('/')
wss.registerSocketEvents(socket) 	// Handling all WebSocket events in wss.js file

webRTCHandler.getLocalPreview()

const leftPanel = $('[name=left-panel]')
const socketIdCopyButton = $('[name=socket-id-copy-button]')
const personalCodeInput = $('[name=personal-code-input]')
const personalChatButton = $('[name=personal-chat-button]')
const personalVideoCallButton = $('[name=personal-video-call-button]')
const strangerChatButton = $('[name=stranger-chat-button]')
const strangerVideoCallButton = $('[name=stranger-video-call-button]')
const allowFromStrangerInput = $('[name=allow-from-stranger] input')

const stopRecordingButton = $('[name=stop-recording]')
const callButton = $('button[name=call]')

const cameraIcon = $('label[for=camera-on-off]')
const cameraInputCheckbox = $('#camera-on-off')
const microphoneIcon = $('label[for=microphone-on-off]')
const microphoneInputCheckbox = $('#microphone-on-off')
const callIcon = $('button[name=call]')
const screenSharingIcon = $('label[for=flip-camera]')
const screenSharingInputCheckbox = $('#flip-camera')
const recordingIcon = $('label[for=recording]')
const recordingInputCheckbox = $('#recording')




// Reset to default
personalCodeInput.value = ''
cameraInputCheckbox.checked = false
microphoneInputCheckbox.checked = false 	

export const toggleScreenSharingStyle = (checked=false) => {
	screenSharingInputCheckbox.checked = checked
}






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



export const lockLeftPanel = () => {
	leftPanel.classList.add('active') 		// lock panel in caller side
}
export const unlockLeftPanel = () => {
	leftPanel.classList.remove('active') 	// unloack panel in caller side
}

const closeCallHandler = () => {
	// Step-1: stop call from caller side
	ui.toggleCallStyle(false) 				

	// Step-2: stop call from callee side
	const preOfferAnswer = constants.preOfferAnswer.CALL_CLOSED
	webRTCHandler.sendPreOfferAnswer(preOfferAnswer) 	

	// Step-3: remove click block 
	unlockLeftPanel()
}

callButton.addEventListener('click',  closeCallHandler)
stopRecordingButton.addEventListener('click', (evt) => {
	closeCallHandler()
	// save recorded files too
})


cameraIcon.addEventListener('click', (evt) => {
	evt.preventDefault()
	const { localStream } = store.getState()

	localStream.getVideoTracks().forEach( track => {
		track.enabled = !track.enabled 
		cameraInputCheckbox.checked = !track.enabled
	})
})

microphoneIcon.addEventListener('click', (evt) => {
	evt.preventDefault()
	const { localStream } = store.getState()

	localStream.getAudioTracks().forEach( track => {
		track.enabled = !track.enabled 
		microphoneInputCheckbox.checked = !track.enabled
	})
})

callIcon.addEventListener('click', (evt) => {
	evt.preventDefault()
	
	webRTCHandler.closingCall()
})

screenSharingIcon.addEventListener('click', (evt) => {
	evt.preventDefault()
	
	const { screenSharingActive } = store.getState()
	webRTCHandler.switchBetweenCameraAndScreenSharing( screenSharingActive )
})
recordingIcon.addEventListener('click', (evt) => {
	evt.preventDefault()
	
	console.log('recordingIcon ')
})


