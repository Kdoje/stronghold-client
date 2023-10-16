import io from 'socket.io-client'
import Board from './game/board/Board'
import { getUrl } from './utils/FetchUtils'
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import  {GAME_BOARD, DECK_EDITOR, MAIN_MENU} from 'common/Routes'
import MainMenu from './MainMenu/MainMenu';


const router = createBrowserRouter([
  {
    path: "/",
    element: <div><Outlet/></div>,
    children: [
      {
        path: "/",
        element: <Navigate to={MAIN_MENU}/>
      },
      {
        path: MAIN_MENU,
        element: <MainMenu/>
      },
      {
        path: DECK_EDITOR,
        element: <div>Fuck me</div>
      },
      {
        path: GAME_BOARD,
        element: <Board socket={io(getUrl())}/>
      }
    ]
  }
]);

function App() {
  return (
    <RouterProvider router={router} />
  )
}
export default App
