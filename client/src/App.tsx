import io from 'socket.io-client'

import Board from './board/Board'
import { getUrl } from './utils/FetchUtils'

let url = getUrl()

console.log(`connecting to url ${url}`)
const socket = io(url);

function connect() {
  console.log("connecting");
  socket.on('chat message', function (msg) {
    console.log(`got chat message ${msg}`);
    var item = document.createElement('li');
    item.textContent = msg;
  });
  socket.emit("aaa", {val1: "event_name", val2: "hi, it's me"})
}

function App() {
  function gameApp() {
    console.log(typeof socket);
    return (
      <Board {...{socket: socket}}/>
    )
  }
  return gameApp();
}
connect();
export default App
