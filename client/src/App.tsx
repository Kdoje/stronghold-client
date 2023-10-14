import io from 'socket.io-client'

import Board from './game/board/Board'
import { getUrl } from './utils/FetchUtils'

let url = getUrl()

console.log(`connecting to url ${url}`)
const socket = io(url);

function App() {
  function gameApp() {
    return (
      <Board {...{socket: socket}}/>
    )
  }
  return gameApp();
}
export default App
