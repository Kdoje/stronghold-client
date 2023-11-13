import { MAIN_MENU } from 'common/Routes';
import { useNavigate } from 'react-router-dom';

import css from './DeckEditor.module.css';
import { UnitCard } from '../game/board/cards/UnitCard';
import React, { useRef, useState } from 'react';
import { AnyCardT } from 'common/types/game-data';


export default function DeckEditor() {
    let testCard = {
        name: `Sheoldred, The Apocolypse`,
        description: "Breaks standard", cost: "5",
        type: "Unit", subtype: "Insectoid Horror",
        value: "A", attack: "4", health: "5", move: "1"
    };

    const [focusedCard, setFocusedCard] = useState<AnyCardT|undefined>(testCard);

    let timer = useRef<NodeJS.Timeout|undefined>(undefined);
    let focusedCardOverlayStyle = useRef<React.CSSProperties>(
        { visibility: "hidden" } as React.CSSProperties
    );
    let focusedCardStyle = useRef<React.CSSProperties>({position: "absolute"})

    const navigate = useNavigate();
   
    // TODO populate this with a map of card to quantity
    let cardInstances : React.ReactElement[] = [];
    for (let i = 0; i < 90; i++) {
        testCard.name = `Sheoldred, The Apocolypse ${i}`
        let curCard = {...testCard};
        // TODO convert this into an element that includes pips for card count
        cardInstances.push(<div onMouseEnter={(e) => cardHovered(e, curCard)} 
            onMouseLeave={(e) => cardHovered(e, undefined)}
            className={css.cardPreview} ><UnitCard  {...testCard}/></div>)
    }

    // TODO onClick, move a card to the card pool area

    // TODO create a component for the card in the card pool and include +/- buttons 
    // on the component

    function cardHovered(e: React.MouseEvent, card: AnyCardT|undefined) {
        const target = e.currentTarget as HTMLElement
        if (card) {
            target.style.outlineColor = "blue";
            target.style.outlineStyle = "inset";
            target.style.outlineWidth = "10px"
            timer.current = setTimeout(function() {
                let targetRect = target.getBoundingClientRect();
                focusedCardOverlayStyle.current = {}
                focusedCardStyle.current = {
                    position: "absolute",
                    top: targetRect.top
                }
                if (window.innerWidth < targetRect.right + 300) {
                    // sets offset from the right of the screen to the right of this elt
                    focusedCardStyle.current["right"] = window.innerWidth - targetRect.left
                } else {
                    focusedCardStyle.current["left"] = targetRect.right;
                }
                setFocusedCard(card);
                    
			}, 300);
        } else {
            clearTimeout(timer.current);
            focusedCardOverlayStyle.current = {visibility: "hidden"} as React.CSSProperties;
            target.style.outlineStyle = "hidden";
            target.style.outlineWidth = "0px"
            setFocusedCard(card);
        }
    }

    // TODO create a set to represent the cards in deck, then 
    // parse it into a Map<cost: num, List<Card>> to decklist columns in deck contents

    return (<>
        <div className={css.container}>
            <div className={css.navBar}>
                <div className={css.title}>
                    <button className={css.button + " " + css.back}
                        onClick={() => { navigate(MAIN_MENU) }}>{'< Menu'}</button>
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
        <div style={focusedCardOverlayStyle.current} className={css.modalWrapper}>
            {
                focusedCard ?
                    <div style={focusedCardStyle.current}><UnitCard  {...focusedCard} /></div> :
                    <></>
            }
        </div>
    </>
    )
}