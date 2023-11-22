import { MAIN_MENU } from 'common/Routes';
import { useNavigate } from 'react-router-dom';

import css from './DeckEditor.module.css';
import { UnitCard } from '../game/board/cards/UnitCard';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnyCardT, UnitCardT } from 'common/types/game-data';
import QuantityDisplay from './QuantityDisplay';
import { DeckEditorContext } from './DeckEditorContext';
import toast, { Toaster } from 'react-hot-toast';
import { getUrl } from '../utils/FetchUtils';
import { StratagemCard } from '../game/board/cards/StratagemCard';
import SearchBar from './SearchBar';

export default function DeckEditor() {

    const cardPoolElt = useRef<HTMLDivElement|null>(null)

    const CARD_FIELDS = ['name',
        'cost',
        'type',
        'subtype',
        'description',
        'value',
        'attack',
        'health',
        'move'
    ]
    const [hoveredCard, setHoveredCard] = useState<AnyCardT|undefined>(undefined);
    const [cardPool, setCardPool] = useState<Map<AnyCardT, number>>(new Map<AnyCardT, number>());
    const [deckContents, setDeckContents] = useState<Map<AnyCardT, number>>(new Map<AnyCardT, number>());
    const [focusedCard, setFocusedCard] = useState<AnyCardT|undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState<string>("");

    let hoverTimer = useRef<NodeJS.Timeout|undefined>(undefined);
    let scrollTimer = useRef<NodeJS.Timeout|undefined>(undefined);

    let focusedCardOverlayStyle = useRef<React.CSSProperties>(
        { visibility: "hidden" } as React.CSSProperties
    );
    let focusedCardStyle = useRef<React.CSSProperties>({position: "absolute"})

    const navigate = useNavigate();
   
    async function generateCardPool() {
        let requestOptions = {
            method: 'GET',
            headers: { 'accept': 'application/json' },
        };
        
        const response = await fetch(`${getUrl()}/cardpool`, requestOptions);
        const data = await response.json();
        setCardPool(new Map(JSON.parse(data.cardPool)));
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

    function saveDeck() {
        let deckList = "";
        for (let [card, quantity] of deckContents) {
            if (quantity > 0) {
                deckList += `${quantity} ${card.name.toString()}\n`
            }
        }
        toast.success("Deck copied to clipboard!", {style:{fontFamily: 'sans-serif'}})
        navigator.clipboard.writeText(deckList)
    }

    function getCardRender(card: AnyCardT) {
        let cardRender = <StratagemCard {...card} />
        if ((card as UnitCardT).attack !== "") {
            cardRender = <UnitCard {...card as UnitCardT} />
        }
        return cardRender;
    }

    function getCardText(card: AnyCardT) {
        let baseCardText: string = "";
        CARD_FIELDS.forEach((field) => {
            baseCardText += (card[field as keyof AnyCardT] ?? "")
        })
        return baseCardText;
    }

    function matchesSearchTerm(card: AnyCardT) {
        return searchTerm === "" || getCardText(card).toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase());
    }

    function scrollCardPoolPage(forward: boolean) {
        if (forward) {
            cardPoolElt.current!.scrollLeft += cardPoolElt.current!.clientWidth;
        } else {
            cardPoolElt.current!.scrollLeft -= cardPoolElt.current!.clientWidth;
        }
    }

    const modifyDeckContentsCallback = useCallback((card: AnyCardT, qtyToAdd: number) => {
        modifyDeckContents(card, qtyToAdd);
    }, [modifyDeckContents])

    
    let sortedCards = new Array(...cardPool.keys()).sort((c1, c2) => {
        if (c1.cost !== c2.cost) {
            return c1.cost < c2.cost ? -1 : 1;
        } else if (c1.type !== c2.type) {
            return c1.type.localeCompare(c2.type);
        } else if (c1.subtype !== c2.subtype) {
            return (c1.subtype ?? "").localeCompare(c2.subtype ?? "");
        } else {
            return (c1.name).localeCompare(c2.name);
        }
    });

    console.log("search term is " + searchTerm)

    let cardPoolInstances : React.ReactElement[] = [];
    for (let card of sortedCards) {
        // only render cards w/one or more copy available
        let quantity = cardPool.get(card) ?? 0;
        if (quantity > 0 && matchesSearchTerm(card)) {
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
                    className={css.cardPreview}>{getCardRender(card)}
                </div>
            </div>)
        }
    }

    useEffect(() => {
        if (cardPoolElt.current !== null) {
            // get the ref to the element then add:
            cardPoolElt.current.addEventListener('wheel', (e: WheelEvent) => {
                if (e.deltaY !== 0) {
                    // use a timeout to de-bounce scroll events
                    clearTimeout(scrollTimer.current);
                    scrollTimer.current = setTimeout(function () {
                        clearOverlay();
                        e.preventDefault();
                        e.stopPropagation();
                        cardPoolElt.current!.scrollLeft += e.deltaY;
                    });
                }
            });
        }
        else {
            throw new Error("cardPoolElt not found, can't enable scrolling.")
        }
    })

    let deckInstances: React.ReactElement[] = [];
    let costQtyMap = new Map<number, number>();
    let totalCostMap = new Map<number, number>();
    let cardCount = 0;

    for (let [card, quantity] of deckContents) {
        if (quantity > 0) {
            let plusEnabled = (cardPool.get(card) ?? 0) > 0;
            let focused = focusedCard?.name == card.name;
            let cost = Number(card.cost);
            cardCount += quantity;
            costQtyMap.set(cost, (costQtyMap.get(cost) ?? 0) + 1);
            totalCostMap.set(cost, (totalCostMap.get(cost) ?? 0) + quantity);
            deckInstances.push(<div key={card.name} className={css.deckCard}
                style={{ gridArea: `${costQtyMap.get(cost)}/${(cost)+ 1}` }} >

               <QuantityDisplay focused={focused} quantity={quantity} plusEnabled={plusEnabled} card={card}/>
                <div style={{ gridRow: 1, gridColumn: 1 }} onMouseEnter={(e) => cardHovered(e, card)}
                    onMouseLeave={(e) => cardHovered(e, undefined)}
                    onClick={(e) => {e.stopPropagation(); setFocusedCard(card); clearOverlay();}}>
                    {getCardRender(card)}
                </div>
            </div>);
        }
    }

    let costBreakdown = "";
    let lowerBoundCardCount = 0;
    for(let i = 0; i < 7; i++) {
        lowerBoundCardCount += (totalCostMap.get(i) ?? 0);
        costBreakdown += `${i}s:${totalCostMap.get(i) ?? 0} `
    }

    costBreakdown += `7+:${cardCount - lowerBoundCardCount}`
    

    return (<>
        <Toaster position="top-center"/>
        <div className={css.container} onClick={() => { setFocusedCard(undefined) }}>
            <DeckEditorContext.Provider value={{ modifyDeckContents: modifyDeckContentsCallback }}>
                <div className={css.navBar}>
                    <div className={css.title}>
                        <button className={css.button + " " + css.back}
                            onClick={() => { navigate(MAIN_MENU) }}>{'< Menu'}</button>
                        <SearchBar placeholderText='search' onSubmit={(searchTerm) => setSearchTerm(searchTerm)} />
                    </div>
                    <div className={css.titleText}>Deck Editor</div>
                    <div className={css.deckGenerationSettings}>
                        <button className={css.button + " " + css.generate} onClick={() => generateCardPool()}>Generate Cardpool</button>
                        <button className={css.button + " " + css.submit} onClick={() => {saveDeck()}}>Save Deck</button>
                    </div>
                </div>
                <div style={{ gridArea: 'cardPool', display: 'flex' }}>
                    <button className={css.cardPoolScrollButton + " " + css.generate}
                        onClick={() => scrollCardPoolPage(false)}>{'<'}</button>
                    <div ref={cardPoolElt} className={css.cardPoolView}>{cardPoolInstances}</div>
                    <button className={css.cardPoolScrollButton + " " + css.generate}
                        onClick={() => scrollCardPoolPage(true)}>{'>'}</button>
                </div>
                <div className={css.deckMetadata}>
                    <div className={css.sizeMetadata}>
                        {cardCount} card(s)
                    </div>
                    <div className={css.curveMetadata}>{costBreakdown}</div>
                </div>
                <div className={css.deckContents}>{...deckInstances}</div>
            </DeckEditorContext.Provider>
        </div>
        <div style={focusedCardOverlayStyle.current} className={css.modalWrapper}>
            {
                hoveredCard ?
                    <div style={focusedCardStyle.current}>{getCardRender(hoveredCard)}</div> :
                    <></>
            }
        </div>
    </>
    )
}