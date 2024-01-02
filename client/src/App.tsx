import io from 'socket.io-client'
import Board from './game/board/Board'
import { getUrl } from './utils/FetchUtils'
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import  {GAME_BOARD, DECK_EDITOR, MAIN_MENU, PREVIEW_PAGE} from 'common/Routes'
import MainMenu from './MainMenu/MainMenu';
import DeckEditor from './DeckEditor/DeckEditor';
import PreivewPage from './PreviewPage/PreviewPage';


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
        element: <DeckEditor/>
      },
      {
        path: PREVIEW_PAGE,
        element: <PreivewPage/>
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
