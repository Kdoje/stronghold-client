import { Link, Navigate, useNavigate } from 'react-router-dom'
import css from './MainMenu.module.css'
import  {GAME_BOARD, DECK_EDITOR} from 'common/Routes'

export default function MainMenu() {
    const navigate = useNavigate();
    return(
        <div className={css.mainMenuContainer}>
            <button className={css.menuButton} onClick={() => navigate(GAME_BOARD)}>
                Enter Game
            </button>
            <button className={css.menuButton} onClick={() => navigate(DECK_EDITOR)}>
                Deck Editor
            </button>
        </div>
    )
}