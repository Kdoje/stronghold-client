import { MAIN_MENU } from 'common/Routes';
import { useNavigate } from 'react-router-dom';

import css from './DeckEditor.module.css';


export default function DeckEditor() {
    const navigate = useNavigate();

    return (
        <div className={css.container}>
            <div className={css.navBar}>
                <div className={css.title}>
                    <button className={css.titleText}
                        onClick={() => { navigate(MAIN_MENU)}}>{'< Menu'}</button>
                    <div className={css.titleText}>Deck Editor</div>
                </div>
                
                <div className={css.deckGenerationSettings}>
                    <button className={css.button + " " + css.generate}>Generate Cardpool</button>
                    <button className={css.button + " " + css.submit}>Save Deck</button>
                </div>
            </div>
            <div className={css.cardPool}></div>
            <div className={css.deckMetadata}>
                <div className={css.sizeMetadata}>
                    40 card(s)
                </div>
                <div className={css.curveMetadata}>1s:6 2s:5 3s:5 4s:2 5s:1</div>
            </div>
            <div className={css.deckContents}></div>
        </div>
    )
}