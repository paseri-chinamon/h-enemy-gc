var socketio = io.connect('https://phonegameserver.herokuapp.com');
var playerlist = []

//websocketコールバックの準備
socketio.on("gameConnectNotice", function (data) { console.log(data); });
socketio.on("playerAddNotice", function (data) { playerAdd(data); });
socketio.on("playerActionNotice", function (data) { playerAction(data) });
socketio.on("playerDisconnectNotice", function (data) { playerRemove(data) });

function serverConnected() {
  socketio.emit("gameConnected", 'game');
}

function playerNotice(player_socket_id, message) {
  socketio.emit("gameAction", player_socket_id, message);
}

window.onload = function () {
  serverConnected();
}