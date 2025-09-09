// Глобальный экземпляр WebSocket сервера
let webSocketInstance = null;

const setWebSocketInstance = (wss) => {
    webSocketInstance = wss;
};

const getWebSocketInstance = () => {
    return webSocketInstance;
};

module.exports = {
    setWebSocketInstance,
    getWebSocketInstance
};
