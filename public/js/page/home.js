import { $ } from '../module/utils.js'
import * as wss from '../module/wss.js'
import * as store from '../module/store.js'
import * as webRTCHandler from '../module/webRTCHandler.js'
import * as constants from '../module/constants.js'
import * as ui from '../module/ui.js'
import * as elements from '../module/elements.js'
import * as recording from '../module/recording.js'

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

const callPanel = $('[name=call-panel]')
const microphoneIcon = $('label[for=microphone-on-off]')
const microphoneInputCheckbox = $('#microphone-on-off')
const cameraIcon = $('label[for=camera-on-off]')
const cameraInputCheckbox = $('#camera-on-off')
const callIcon = $('button[name=call]')
const screenSharingIcon = $('label[for=flip-camera]')
const screenSharingInputCheckbox = $('#flip-camera')
const recordingIcon = $('label[for=recording]')
const recordingInputCheckbox = $('#recording')
const recordingPanel = $('[name=recording-panel]')
const stopRecordingButton = $('[name=stop-recording]')
const recordingPayPauseButton = $('[for=play-pause]')
const recordingPlayPauseInputCheckbox = $('#play-pause')

const messageContainer = $('[name=message-container]')
const sendMessageContainer = $('[name=send-message-container]')
const sendMessageInput = $('input[name=send-message-input]')
const sendMessageButton = $('button[name=send-message-button]')


// Reset to default
personalCodeInput.value = ''
microphoneInputCheckbox.checked = false 	
cameraInputCheckbox.checked = false
recordingInputCheckbox.checked = false






export const lockLeftPanel = () => {
	leftPanel.classList.add('active') 		// lock panel in caller side
}
export const unlockLeftPanel = () => {
	leftPanel.classList.remove('active') 	// unloack panel in caller side
}

export const enableMessagePanel = () => {
	sendMessageContainer.style.pointerEvents = 'auto'
}
export const addYourMessage = (message) => {
	elements.createYourMessage(messageContainer, message)
}
export const addTheirMessage = (message) => {
	elements.createTheirMessage(messageContainer, message)
}

export const toggleScreenSharingStyle = (checked=false) => {
	screenSharingInputCheckbox.checked = checked
}




export const isAudioCall = (isAudio = true) => {
	callPanel.style.display = 'flex'
	callPanel.classList.toggle('called', isAudio)
}

// isAudioCall(false)




socketIdCopyButton.addEventListener('click', () => {
	navigator.clipboard.writeText(store.getState().socketId)
})

personalChatButton.addEventListener('click', (evt) => {
	const calleePersonalCode = personalCodeInput.value 
	if(!calleePersonalCode) return console.log('calleePersonalCode is empty')

	const data = {
		callType: constants.callType.PERSONAL_CHAT_CODE,
		calleePersonalCode
	}
	webRTCHandler.sendPreOffer(data)
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



const closeCallHandler = () => {
	// Step-1: stop call from caller side
	ui.toggleCallStyle(false) 				

	// Step-2: stop call from callee side
	const preOfferAnswer = constants.preOfferAnswer.CALL_CLOSED
	webRTCHandler.sendPreOfferAnswer(preOfferAnswer) 	

	// Step-3: remove click block 
	unlockLeftPanel()
}

microphoneIcon.addEventListener('click', (evt) => {
	evt.preventDefault()
	const { localStream } = store.getState()

	localStream.getAudioTracks().forEach( track => {
		track.enabled = !track.enabled 
		microphoneInputCheckbox.checked = !track.enabled
	})
})

cameraIcon.addEventListener('click', (evt) => {
	evt.preventDefault()
	const { localStream } = store.getState()

	localStream.getVideoTracks().forEach( track => {
		track.enabled = !track.enabled 
		cameraInputCheckbox.checked = !track.enabled
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

const showRecordingPanel = () => {
	recordingInputCheckbox.checked = true
	recordingPanel.style.display = 'flex'
}
const hideRecordingPanel = () => {
	recordingInputCheckbox.checked = false
	recordingPanel.style.display = 'none'
}


recordingIcon.addEventListener('click', (evt) => {
	evt.preventDefault()

	if(recordingInputCheckbox.checked === true) {
		hideRecordingPanel()
		recording.stopRecording()
		return 
	}

	showRecordingPanel()
	recording.startRecording()
})
stopRecordingButton.addEventListener('click', (evt) => {
	evt.preventDefault()
	hideRecordingPanel()
	recording.stopRecording()
})

recordingPayPauseButton.addEventListener('click', (evt) => {
	evt.preventDefault()

	if(recordingPlayPauseInputCheckbox.checked === true) {
		recordingPlayPauseInputCheckbox.checked = false
		recording.pauseRecording()
		console.log('pause')
		return
	}

	recordingPlayPauseInputCheckbox.checked = true
	recording.resumeRecording()
	console.log('resume')
})



const sendMessageHandler = (message) => {
	webRTCHandler.sendMessageUsingDataChannel(message)	
	addYourMessage(message)
	sendMessageInput.value = ''
}
sendMessageInput.addEventListener('keydown', (evt) => {
	const message = evt.target.value

	if(evt.key === 'Enter') {
		sendMessageHandler(message)
	}
})
sendMessageButton.addEventListener('click', () => {
	const message = sendMessageInput.value
	sendMessageHandler(message)
})
