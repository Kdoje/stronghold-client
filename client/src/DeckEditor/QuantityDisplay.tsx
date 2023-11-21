import React, { MouseEvent, useContext } from 'react';
import css from './DeckEditor.module.css';
import { DeckEditorContext } from './DeckEditorContext';
import { AnyCardT } from 'common/types/game-data';

export default function QuantityDisplay(props: { focused: boolean, quantity: number, plusEnabled: boolean, card: AnyCardT }) {

    let qtyDisplayStyle = {} as React.CSSProperties;

    const modifyDeckContents = useContext(DeckEditorContext).modifyDeckContents;

    function modifyCount(qtyToAdd: number, e: MouseEvent) {
        e.stopPropagation();
        if (qtyToAdd > 0 && props.plusEnabled) {
            modifyDeckContents(props.card, qtyToAdd);
        }
        if (qtyToAdd < 0) {
            modifyDeckContents(props.card, qtyToAdd);
        }
    }

    // use a placeholder div to right-justify the content in the flexbox
    let contents = <>
        <div></div>
        <div>{"x" + props.quantity}</div>
    </>
    if (props.focused) {
        let enabledButtonStyle = {color: "white"} as React.CSSProperties;
        let plusButtonStyle = props.plusEnabled ? enabledButtonStyle :
        {color: "rgba(40, 40, 40)"} as React.CSSProperties;
        contents = <>
            <button className={css.quantityButton} style={enabledButtonStyle} onClick={(e) => modifyCount(-1, e)}>-</button>
            <div>{"x" + props.quantity}</div>
            <button className={css.quantityButton} style={plusButtonStyle} onClick={(e) => modifyCount(1, e)}>+</button>
        </>
    } else {
        qtyDisplayStyle = {pointerEvents: "none"};
    }



    return (
        <div className={css.quantityDisplay} style={qtyDisplayStyle}>
            {contents}
        </div>
    );
}