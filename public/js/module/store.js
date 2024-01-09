let state = {
	socketId: null,
	localStream: null,
	remoteStream: null,
	screenSharingStream: null,
	screenSharingActive: false,
	allowConnectionsFromStrangers: false,
}

export const setSocketId = (socketId) => {
	state = { ...state, socketId }
}

export const setLocalStream = (localStream) => {
	state = { ...state, localStream }
}
export const setScreenSharingStream = (screenSharingStream) => {
	state = { ...state, screenSharingStream }
}
export const setRemoteStream = (remoteStream) => {
	state = { ...state, remoteStream }
}
export const setScreenSharingActive = (screenSharingActive) => {
	state = { ...state, screenSharingActive }
}
export const setAllowConnectionsFromStreangers = (allowConnectionsFromStrangers) => {
	state = { ...state, allowConnectionsFromStrangers }
}