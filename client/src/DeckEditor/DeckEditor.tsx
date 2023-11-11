import { MAIN_MENU } from 'common/Routes';
import { useNavigate } from 'react-router-dom';

import css from './DeckEditor.module.css';
import { UnitCard } from '../game/board/cards/UnitCard';


export default function DeckEditor() {
    const navigate = useNavigate();
    let testCard = {
        name: `Sheoldred, The Apocolypse`,
        description: "Breaks standard", cost: "5",
        type: "Unit", subtype: "Insectoid Horror",
        value: "A", attack: "4", health: "5", move: "1"
    };
    // TODO we need to create a 
    let cardInstances = []
    for(let i = 0; i < 50; i++) {
        cardInstances.push(<div className={css.cardPreview} ><UnitCard  {...testCard} /></div>)
    }
    return (
        <div className={css.container}>
            <div className={css.navBar}>
                <div className={css.title}>
                <button className={css.button + " " + css.back}
                        onClick={() => { navigate(MAIN_MENU)}}>{'< Menu'}</button>
                    <div className={css.titleText}>Deck Editor</div>
                </div>
                
                <div className={css.deckGenerationSettings}>
                    <button className={css.button + " " + css.generate}>Generate Cardpool</button>
                    <button className={css.button + " " + css.submit}>Save Deck</button>
                </div>
            </div>
            <div className={css.cardPoolView}>{cardInstances}</div>
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