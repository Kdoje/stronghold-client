import { StratagemCardT } from "common/types/game-data";
import React from "react";
import css from "./Card.module.css"


export class StratagemCard extends React.Component<StratagemCardT & {displayOverlay?: boolean}> {
    render() {
        if (this.props.name === "") {
            return <div></div>;
        }
        let typeLineText = this.props.type;
        if (this.props.subtype && this.props.subtype.length > 0) {
            typeLineText += " - " + this.props.subtype;
        }
        let isGold = this.props.value === "G"
        let cardImage = "stratagem-card.png";
        if (this.props.value === "G") {
            cardImage = "stratagem-card-gold.png";
        }
            return <div className={css.cardContainer}>
                <img className={css.portraitImage} src=""></img>
                <div className={css.titleOverlayText}>{this.props.displayOverlay ? this.props.name + ": " + this.props.cost : undefined}</div>
                <div className={css.titleText}>{this.props.name}</div>
                <div className={css.costText}>{this.props.cost}</div>
                <div className={css.typeText}>{typeLineText}</div>
                <div className={css.descriptionText}>{this.props.description}</div>
                <div className={css.valueText}>{this.props.value}</div>
                <img className={css.cardImage} src={cardImage}></img>
                <div className={css.statsOverlayText}>{this.props.displayOverlay ? this.props.value : undefined}</div>
            </div>;
    }
}

