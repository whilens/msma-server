let webSocketServer = null;

function setWebSocketInstance(wss) {
    webSocketServer = wss;
}

function getWebSocketInstance() {
    return webSocketServer;
}

module.exports = {
    setWebSocketInstance,
    getWebSocketInstance
};