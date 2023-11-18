import { MAIN_MENU } from 'common/Routes';
import { useNavigate } from 'react-router-dom';

import css from './DeckEditor.module.css';
import { UnitCard } from '../game/board/cards/UnitCard';
import React, { useRef, useState } from 'react';
import { AnyCardT, UnitCardT } from 'common/types/game-data';


export default function DeckEditor() {
    let testCard = {
        name: `Sheoldred, The Apocolypse`,
        description: "Breaks standard", cost: "3",
        type: "Unit", subtype: "Insectoid Horror",
        value: "A", attack: "4", health: "5", move: "1"
    };

    const [hoveredCard, setHoveredCard] = useState<AnyCardT|undefined>(undefined);
    const [cardPool, setCardPool] = useState<Map<AnyCardT, number>>(new Map<AnyCardT, number>());
    const [deckContents, setDeckContents] = useState<Map<AnyCardT, number>>(new Map<AnyCardT, number>());
    // TODO create state to track focused card in deck

    let timer = useRef<NodeJS.Timeout|undefined>(undefined);
    let focusedCardOverlayStyle = useRef<React.CSSProperties>(
        { visibility: "hidden" } as React.CSSProperties
    );
    let focusedCardStyle = useRef<React.CSSProperties>({position: "absolute"})

    const navigate = useNavigate();
   
    function generateCardPool() {
        // TODO update this to use the API to get a card list
        let newCardPool = new Map<AnyCardT, number>();
        for (let i = 0; i < 90; i++) {
            testCard.name = `Sheoldred, The Apocolypse ${i}`
            let curCard = {...testCard} as AnyCardT;
            newCardPool.set(curCard, 1);
        }
        setCardPool(newCardPool);
    }

    function clearOverlay() {
        clearTimeout(timer.current);
        focusedCardOverlayStyle.current = {visibility: "hidden"} as React.CSSProperties;
        setHoveredCard(undefined);
    }

    function addInstanceToDeck(card: AnyCardT) {
        let newCardPool = new Map(cardPool);
        let newDeckContents = new Map(deckContents);
        if (newCardPool.get(card) ?? 0 > 0) {
            newCardPool.set(card, newCardPool.get(card)! - 1);
            if (newDeckContents.get(card) ?? 0 > 0) {
                newDeckContents.set(card, newDeckContents.get(card)! + 1);
            } else {
                newDeckContents.set(card, 1);
            }
        }
        clearOverlay();
        setCardPool(newCardPool);
        setDeckContents(newDeckContents);
    }

    let cardPoolInstances : React.ReactElement[] = [];
    for (let [card, quantity] of cardPool) {
        // only render cards w/one or more copy available
        if (quantity > 0) {
            let pips = [];
            for (let i = 0; i < quantity; i++) {
                pips.push(<span key={i} className="material-symbols-outlined" style={{ color: "green" }}>
                    radio_button_unchecked
                </span>);
            }
            cardPoolInstances.push(<div className={css.cardPoolPreviewContainer}  key={card.name}>
                <div className={css.copyCountPipContainer}>{pips}</div>
                <div key={card.name} onMouseEnter={(e) => cardHovered(e, card)}
                    onMouseLeave={(e) => cardHovered(e, undefined)}
                    onClick={() => addInstanceToDeck(card)}
                    className={css.cardPreview} ><UnitCard  {...card} />
                </div>
            </div>)
        }
    }


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
                    focusedCardStyle.current["right"] = window.innerWidth - targetRect.left;
                } else {
                    focusedCardStyle.current["left"] = targetRect.right;
                }
                setHoveredCard(card);
                    
			}, 300);
        } else {
            clearOverlay();
            target.style.outlineStyle = "hidden";
            target.style.outlineWidth = "0px"
        }
    }

    let deckInstances: React.ReactElement[] = [];
    let cardCount = 0;
    for (let [card, quantity] of deckContents) {
        if (quantity > 0) {
            cardCount++;
            // TODO create a component for the card in the deck contents and include +/- buttons 
            // on the component
            deckInstances.push(<div key={card.name} className={css.deckCard}
                style={{ gridColumn: cardCount % 7 }} >
                    {/* TODO enable this to receive pointer events when the card is focused */}
                <div className={css.quantityDisplay} style={{ pointerEvents: "none" }}>
                    {quantity == 1 ? "x2" : quantity}
                </div>
                <div style={{ gridRow: 1, gridColumn: 1 }} onMouseEnter={(e) => cardHovered(e, card)}
                    onMouseLeave={(e) => cardHovered(e, undefined)}>
                    <UnitCard {...card} />
                </div>
            </div>);
        }
    }

    return (<>
        <div className={css.container}>
            <div className={css.navBar}>
                <div className={css.title}>
                    <button className={css.button + " " + css.back}
                        onClick={() => { navigate(MAIN_MENU) }}>{'< Menu'}</button>
                    <div className={css.titleText}>Deck Editor</div>
                </div>

                <div className={css.deckGenerationSettings}>
                    <button className={css.button + " " + css.generate} onClick={() => generateCardPool()}>Generate Cardpool</button>
                    <button className={css.button + " " + css.submit}>Save Deck</button> {/* TODO make this actually save to clipboard */}
                </div>
            </div>
            <div className={css.cardPoolView}>{cardPoolInstances}</div>
            <div className={css.deckMetadata}>
                <div className={css.sizeMetadata}>
                    40 card(s)
                </div>
                <div className={css.curveMetadata}>1s:6 2s:5 3s:5 4s:2 5s:1</div>
            </div>
            <div className={css.deckContents}>{...deckInstances}</div>
        </div>
        <div style={focusedCardOverlayStyle.current} className={css.modalWrapper}>
            {
                hoveredCard ?
                    <div style={focusedCardStyle.current}><UnitCard  {...hoveredCard} /></div> :
                    <></>
            }
        </div>
    </>
    )
}