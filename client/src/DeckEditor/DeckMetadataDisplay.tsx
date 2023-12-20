import { AnyCardT } from "common/types/game-data";
import { useState } from "react";
import css from './DeckEditor.module.css';

export default function DeckMetadataDisplay(props: { deckContents: Map<AnyCardT, number> }) {
    const [focusedCount, setFocusedCount] = useState(0);
    let cardCount = 0;

    let totalCostMap = new Map<number, number>();
    let typeCountMap = new Map<string, number>();
    let subtypeCountMap = new Map<string, number>();

    function updateFocusedCount(increment: boolean) {
        let incrementCount = increment ? 1 : -1;
        setFocusedCount((focusedCount + incrementCount)%2)
    }

    for (let [card, quantity] of props.deckContents) {
        let cost = Number(card.cost);
        cardCount += quantity;
        totalCostMap.set(cost, (totalCostMap.get(cost) ?? 0) + quantity);
        typeCountMap.set(card.type, (typeCountMap.get(card.type) ?? 0) + quantity);
        if (card.subtype) {
            subtypeCountMap.set(card.subtype!, (subtypeCountMap.get(card.subtype) ?? 0) + quantity)
        }
    }
    let costBreakdown = "";
    let lowerBoundCardCount = 0;
    for (let i = 0; i < 7; i++) {
        lowerBoundCardCount += (totalCostMap.get(i) ?? 0);
        costBreakdown += `${i}s:${totalCostMap.get(i) ?? 0} `
    }

    let breakdownToRender = focusedCount % 2 == 0 ? typeCountMap : subtypeCountMap;
    let typalBreakdown = ""
    for (let [name, quantity] of breakdownToRender) {
        typalBreakdown += `${name.substring(0,4)}:${quantity} `;
    }


    costBreakdown += `7+:${cardCount - lowerBoundCardCount}`
    return <div className={css.deckMetadata}>
         <div className={css.curveMetadata}>
            {costBreakdown}
        </div>
        <div className={css.sizeMetadata}>
            <div className={css.contentsMetadata}>
                <div>{typalBreakdown}</div>
                <button onClick={() => {updateFocusedCount(true)}}>{"switch"}</button>
            </div>
            <div>{cardCount} card(s)</div>
        </div>
    </div>
}