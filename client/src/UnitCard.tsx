import React from "react";
import {UnitCardT} from 'common/types/game-data'; 

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
            const imageClassNameBase = "injury-marker-";
            const textClassNameBase = "injury-marker-text-"
            healthValues.map((curHealth, index) => {
                if (index >= 1) {
                    injuryMarkers.push(<img key={"marker-" + index} className={imageClassNameBase + index} src="injury-marker.png"></img>)
                    injuryMarkers.push(<div key={"marker-text-" + index} className={textClassNameBase + index}>{curHealth}</div>)
                }
            })
        }

        let elt = <div className="card-container">
            <img className="portrait-image" src=""></img>
            <div className="title-text">{this.props.name}</div>
            <div className="cost-text">{this.props.cost}</div>
            <div className="type-text">{this.props.type} - {this.props.subtype}</div>
            <div className="description-text">{this.props.description}</div>
            <div className="move-text">{this.props.move}</div>
            {injuryMarkers.map(marker => marker)}
            <div className="health-text">{initialHealth}</div>
            <div className="value-text">{this.props.value}</div>
            <div className="attack-text">{this.props.attack}</div>
            <img className="card-image" src={cardImage}></img>
        </div>;

        return elt;

    }
}

