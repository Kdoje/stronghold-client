import React from "react";
import {UnitCardT} from 'common/types/game-data'; 
import css from "./Card.module.css"

export class UnitCard extends React.Component<UnitCardT> {
    constructor(props: UnitCardT) {
        super(props);

    }

    render() {
        let cardImage = "unit-card.png";
        if (this.props.value === "G") {
            cardImage = "unit-card-gold.png";
        }

        let injuryMarkers: JSX.Element[] = []
        let healthValues = this.props.health.split('|');
        let initialHealth = healthValues[0];
        if (healthValues.length > 1) {
            const imageClassNameBase = "injuryMarker";
            const textClassNameBase = "injuryMarkerText";
            
            healthValues.map((curHealth, index) => {
                if (index >= 1) {
                    injuryMarkers.push(<img key={"marker-" + index} className={css[imageClassNameBase + index]} src="injury-marker.png"></img>)
                    injuryMarkers.push(<div key={"marker-text-" + index} className={css[textClassNameBase + index]}>{curHealth}</div>)
                }
            })
        }

        let statsText =  this.props.value + ": " + this.props.move + " / " ;
        statsText += this.props.attack  + " / ";
        statsText += this.props.health;

        let elt = <div className={css.cardContainer}>
            <img className={css.portraitImage} src=""></img>
            <div className={css.titleOverlayText}>{this.props.name}</div>
            <div className={css.titleText}>{this.props.name}</div>
            <div className={css.costText}>{this.props.cost}</div>
            <div className={css.typeText}>{this.props.type} - {this.props.subtype}</div>
            <div className={css.descriptionText}>{this.props.description}</div>
            <div className={css.moveText}>{this.props.move}</div>
            {injuryMarkers.map(marker => marker)}
            <div className={css.healthText}>{initialHealth}</div>
            <div className={css.valueText}>{this.props.value}</div>
            <div className={css.attackText}>{this.props.attack}</div>
            <img className={css.cardImage} src={cardImage}></img>
            <div className={css.statsOverlayText}>{statsText}</div>
        </div>;

        return elt;

    }
}

