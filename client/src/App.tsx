import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import io from 'socket.io-client'

import Board from './board/Board'

const url = `${window.location.protocol}//${window.location.hostname}:${__PORT__}`
const socket = io(url);

function connect() {
  console.log("connecting");
  socket.on('chat message', function (msg) {
    console.log(`got chat message ${msg}`);
    var item = document.createElement('li');
    item.textContent = msg;
  });
  socket.emit("hi, it's me")
}

function App() {

  const [count, setCount] = useState(0)
  // TODO this would check if we're in dev mode and use the server port to connect to the sockets stuff
  
  // this is the old code for connecting to the socket and sending messages
  function defaultApp() {
    return (
      <div className="App">
        <div>
          <a href="https://vitejs.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://reactjs.org" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => { setCount((count) => count + 1); socket.emit('chat message', `Mr. Kent ${count + 1}`); }}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    )
  }

  function gameApp() {
    console.log(socket);
    return (
      <Board />
    )
  }
  return gameApp();
}
connect();
export default App
