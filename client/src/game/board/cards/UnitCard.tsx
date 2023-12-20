import React from "react";
import {UnitCardT} from 'common/types/game-data'; 
import css from "./Card.module.css"
import {Md5} from 'ts-md5';

export class UnitCard extends React.Component<UnitCardT & {displayOverlay?: boolean}> {
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

        let statsText = <div className={css.statsOverlayContainer}>
            <p className={css.statsOverlayText}>{this.props.move}</p>
            <p className={css.statsOverlayText}>{this.props.attack}/{initialHealth}</p>
        </div>

        let imgSrc = `https://www.gravatar.com/avatar/${Md5.hashStr(this.props.name)}?s=180&d=retro&r=G`

        let elt = <div className={css.cardContainer}>
            <img className={css.portraitImage} src={imgSrc}></img>
            <div className={css.titleOverlayText}>{this.props.displayOverlay ? this.props.name + ":" + this.props.cost : undefined}</div>
            <div className={css.titleText}>{this.props.name}</div>
            <div className={css.costText}>{this.props.cost}</div>
            <div className={css.typeText}>{this.props.type} - {this.props.subtype}</div>
            <div className={css.descriptionText}>{this.props.description}</div>
            <div className={css.moveText}>{this.props.move}</div>
            {injuryMarkers.map(marker => marker)}
            <div className={css.healthText}>{initialHealth}</div>
            <div className={css.valueText}>{this.props.value + " " + this.props.rarity}</div>
            <div className={css.attackText}>{this.props.attack}</div>
            <img className={css.cardImage} src={cardImage}></img>
            {this.props.displayOverlay ? statsText : undefined}
        </div>;

        return elt;

    }
}

