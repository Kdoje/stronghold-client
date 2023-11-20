import { MAIN_MENU } from 'common/Routes';
import { useNavigate } from 'react-router-dom';

import css from './DeckEditor.module.css';
import { UnitCard } from '../game/board/cards/UnitCard';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnyCardT, UnitCardT } from 'common/types/game-data';
import QuantityDisplay from './QuantityDisplay';
import { DeckEditorContext } from './DeckEditorContext';


export default function DeckEditor() {
    let testCard = {
        name: `Sheoldred, The Apocolypse`,
        description: "Breaks standard", cost: "3",
        type: "Unit", subtype: "Insectoid Horror",
        value: "A", attack: "4", health: "5", move: "1"
    };

    const cardPoolElt = useRef<HTMLDivElement|null>(null)

    const [hoveredCard, setHoveredCard] = useState<AnyCardT|undefined>(undefined);
    const [cardPool, setCardPool] = useState<Map<AnyCardT, number>>(new Map<AnyCardT, number>());
    const [deckContents, setDeckContents] = useState<Map<AnyCardT, number>>(new Map<AnyCardT, number>());
    const [focusedCard, setFocusedCard] = useState<AnyCardT|undefined>(undefined);

    let hoverTimer = useRef<NodeJS.Timeout|undefined>(undefined);
    let scrollTimer = useRef<NodeJS.Timeout|undefined>(undefined);

    let focusedCardOverlayStyle = useRef<React.CSSProperties>(
        { visibility: "hidden" } as React.CSSProperties
    );
    let focusedCardStyle = useRef<React.CSSProperties>({position: "absolute"})

    const navigate = useNavigate();
   
    function generateCardPool() {
        // TODO update this to use the API to get a card list
        let newCardPool = new Map<AnyCardT, number>();
        for (let i = 0; i < 90; i++) {
            testCard.cost = `${i % 7}`
            testCard.name = `Sheoldred, The Apocolypse ${i}`
            let curCard = {...testCard} as AnyCardT;
            newCardPool.set(curCard, 3);
        }
        setCardPool(newCardPool);
        setDeckContents(new Map());
    }

    function clearOverlay() {
        clearTimeout(hoverTimer.current);
        focusedCardOverlayStyle.current = {visibility: "hidden"} as React.CSSProperties;
        setHoveredCard(undefined);
    }

    function addInstanceToDeck(card: AnyCardT) {
        let newCardPool = new Map(cardPool);
        let newDeckContents = new Map(deckContents);
        if ((newCardPool.get(card) ?? 0) > 0) {
            newCardPool.set(card, newCardPool.get(card)! - 1);
            newDeckContents.set(card, (newDeckContents.get(card) ?? 0) + 1);
        }
        clearOverlay();
        setCardPool(newCardPool);
        setDeckContents(newDeckContents);
    }

    function cardHovered(e: React.MouseEvent, card: AnyCardT|undefined) {
        const target = e.currentTarget as HTMLElement
        if (card) {
            target.style.outlineColor = "blue";
            target.style.outlineStyle = "inset";
            target.style.outlineWidth = "10px"
            hoverTimer.current = setTimeout(function() {
                let targetRect = target.getBoundingClientRect();
                focusedCardOverlayStyle.current = {}
                focusedCardStyle.current = {
                    pointerEvents: "none",
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

    function modifyDeckContents(card: AnyCardT, qtyToAdd: number) {
        if (qtyToAdd > 0) {
            if (cardPool.has(card) && cardPool.get(card)! > 0) {
                cardPool.set(card, cardPool.get(card)! - 1);
                deckContents.set(card, (deckContents.get(card) ?? 0) + 1);
                setCardPool(new Map(cardPool));
                setDeckContents(new Map(deckContents));
            }
        } if (qtyToAdd < 0) {
            let qtyToRemove = -qtyToAdd;
            if (deckContents.has(card) && (deckContents.get(card)! - qtyToRemove) >= 0) {
                deckContents.set(card, deckContents.get(card)! - qtyToRemove);
                cardPool.set(card, (cardPool.get(card) ?? 0) + qtyToRemove);
                setCardPool(new Map(cardPool));
                setDeckContents(new Map(deckContents));
            }
        }
    }

    const modifyDeckContentsCallback = useCallback((card: AnyCardT, qtyToAdd: number) => {
        modifyDeckContents(card, qtyToAdd);
    }, [modifyDeckContents])

    
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

    useEffect(() => {
        if (cardPoolElt.current !== null) {
            // get the ref to the element then add:
            cardPoolElt.current.addEventListener<'wheel'>('wheel', (e: WheelEvent) => {
                if (e.deltaY !== 0) {
                    // use a timeout to de-bounce scroll events
                    clearTimeout(scrollTimer.current);
                    scrollTimer.current = setTimeout(function () {
                        clearOverlay();
                        e.preventDefault();
                        e.stopPropagation();
                        cardPoolElt.current!.scrollLeft += e.deltaY < 0 ? -cardPoolElt.current!.clientWidth : cardPoolElt.current!.clientWidth
                    });
                }
            });
        }
        else {
            throw new Error("cardPoolElt not found, can't enable scrolling.")
        }
    })

    let deckInstances: React.ReactElement[] = [];
    let costQtyMap = new Map<number, number>()
    for (let [card, quantity] of deckContents) {
        if (quantity > 0) {
            let plusEnabled = (cardPool.get(card) ?? 0) > 0;
            let focused = focusedCard?.name == card.name;
            let cost = Number(card.cost);
            costQtyMap.set(cost, (costQtyMap.get(cost) ?? 0) + 1);
            deckInstances.push(<div key={card.name} className={css.deckCard}
                style={{ gridArea: `${costQtyMap.get(cost)}/${(cost)+ 1}` }} >

               <QuantityDisplay focused={focused} quantity={quantity} plusEnabled={plusEnabled} card={card}/>
                <div style={{ gridRow: 1, gridColumn: 1 }} onMouseEnter={(e) => cardHovered(e, card)}
                    onMouseLeave={(e) => cardHovered(e, undefined)}
                    onClick={(e) => {e.stopPropagation(); setFocusedCard(card); clearOverlay();}}>
                    <UnitCard {...card} />
                </div>
            </div>);
        }
    }

    return (<>
        <div className={css.container} onClick={() => { setFocusedCard(undefined) }}>
            <DeckEditorContext.Provider value={{ modifyDeckContents: modifyDeckContentsCallback }}>
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
                <div ref={cardPoolElt} className={css.cardPoolView}>{cardPoolInstances}</div>
                <div className={css.deckMetadata}>
                    <div className={css.sizeMetadata}>
                        40 card(s)
                    </div>
                    <div className={css.curveMetadata}>1s:6 2s:5 3s:5 4s:2 5s:1</div>
                </div>
                <div className={css.deckContents}>{...deckInstances}</div>
            </DeckEditorContext.Provider>
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